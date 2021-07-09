import json
import pandas as pd
import csv
from tqdm import tqdm
from collections import defaultdict

citations_path = "/Users/anastasia/Documents/cap-experiments/citations.csv"
metadata_path = "/Users/anastasia/Documents/cap-experiments/metadata.csv"
normalized_citations_path = "/Users/anastasia/Documents/cap-experiments/normalized_citations.csv"
print('---create metadata df---')
metadata_df = pd.read_csv(r"%s" % metadata_path)

# if exists
with open("numdf_dict.json", "r") as f:
    numdf_dict = json.load(f)

mdf = metadata_df[['id', 'decision_date_original', 'jurisdiction__name', 'name_abbreviation']]
mdf_nump = mdf.to_numpy()
numdf_dict = {str(m[0]): (m[1][:4], m[2], m[3]) for m in mdf_nump}

with open("numdf_dict.json", "w") as outfile:
    json.dump(numdf_dict, outfile)


def get_year_from_cite(id):
    return numdf_dict[id][0]


def get_info_from_cite(id):
    return numdf_dict[id]


def get_cite_name(id):
    return numdf_dict[id][2]


invert = []
# invert looks like this:
# {destination_cite: (destination_year, jurisdiction), 'source,', source_year}
with open(citations_path) as csvfile:
    csvreader = csv.reader(csvfile)
    for row in tqdm(csvreader, total=4764972):
        # add to bottom of df
        source = row.pop(0)
        for destination in row:
            invert.append({destination: (get_info_from_cite(destination), source + ',', get_year_from_cite(source))})

with open("invert.json", "w") as outfile:
    json.dump(invert, outfile)

# if exists
with open("invert.json", "r") as outfile:
    invert = json.load(outfile)

inv = defaultdict(lambda: (defaultdict(lambda: ("", 0)), None, None))
# inv looks like this:
# {destination: ({source_year: (source, source_count)}, dest_year, destination_jurisdiction)}
for d in tqdm(invert):
    dest, v = list(d.items())[0]
    ((dyr, d_jur, _), s, syr) = v
    source_dict, y, j = inv[dest]
    source_dict[syr] = (source_dict[syr][0] + s, source_dict[syr][1] + 1)
    inv[dest] = (source_dict, dyr, d_jur)

with open("inv-final.json", "w") as outfile:
    json.dump(inv, outfile)

# {1976: {jur: [count, [{case_id: casename}, {case_id: casename}]]} }
years = defaultdict(lambda: defaultdict(lambda: defaultdict(lambda: [0, []])))
for dest in tqdm(inv):
    source_dict, _, dest_jur = inv[dest]
    for year in source_dict:
        _, count = source_dict[year]
        years[year][dest_jur][0][0] += count
        years[year][dest_jur][0][1].append({dest: (get_cite_name(dest), count)})

for year in years:
    with open("years/%s.json" % year, "w") as f:
        json.dump(years[year], f)

# order years-jurs by most popular case
with open("years/1953.json", "r") as f:
    year = json.load(f)

print('----sorting years/jurs----')
for year in years:
    sorted_year = {}
    for jur in years[year]:
        # zeros might need to be stringed, depending on if you've loaded from files
        cases = years[year][jur][0][1]
        sc = sorted(cases, key=lambda case: list(case.values())[0][1], reverse=True)
        sorted_year[jur] = [
            years[year][jur][0][0],
            sc
        ]

    with open("sorted/%s.json" % year, "w") as fi:
        json.dump(sorted_year, fi)
