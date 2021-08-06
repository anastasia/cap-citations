import os
import json
import requests

earliest_year = 1768
latest_year = 2018

# all of these could be combined into a couple steps, but without parallelizing
# this takes too long, so I did this in a little more than a couple steps

# -------> get top twenty cases
# [{case_id: [jur, name, count]}]
for year in range(earliest_year, latest_year + 1):
    try:
        with open(os.path.join('./sorted', str(year) + '.json')) as f:
            data = json.load(f)

        pre_sorted_cases = []
        for jur in data:
            cases = data[jur][1]
            for case in cases:
                case_id = list(case.keys())[0]
                ordered_case = {
                    case_id: [jur] + case[case_id]
                }
                pre_sorted_cases.append(ordered_case)

        sorted_cases = sorted(pre_sorted_cases, key=lambda case: list(case.values())[0][2], reverse=True)

        with open(os.path.join('./sorted-citations', str(year) + '.json'), "w") as f:
            json.dump(sorted_cases, f)
    except Exception as e:
        print(e)

# -------> sort cases by most cited per year
for year in range(earliest_year, latest_year + 1):
    try:
        with open(os.path.join('./sorted', str(year) + '.json'), "r") as f:
            data = json.load(f)
        ordered_cases = {}
        for jur in data:
            if jur == 'U.S.':
                # US screws up the count
                continue
            pre_sorted_cases = [data[jur][0]]  # <-- add total count
            cases = data[jur][1]
            for case in cases:
                case_id = list(case.keys())[0]
                ordered_case = {
                    case[case_id][0]: [case_id, case[case_id][1]]
                }
                pre_sorted_cases.append(ordered_case)

            ordered_cases[jur] = pre_sorted_cases[:11]  # <-- top 10 including count
        with open(os.path.join('./sorted-citations-with-date', str(year) + '.json'), "w") as f:
            json.dump(ordered_cases, f)
    except:
        pass


# -------> rewrite file with more data
for year in range(earliest_year, latest_year + 1):
    try:
        with open(os.path.join('./sorted-citations-with-date', str(year) + '.json'), "r") as f:
            data = json.load(f)
        fixed_data = {}
        for jur in data:
            fixed_data[jur] = [data[jur][0]]
            jur_data = []
            for case in data[jur][1:]:
                case_name = list(case.keys())[0]
                case_id, count = case[case_name]
                try:
                    metadata = requests.get("https://api.case.law/v1/cases/" + case_id).json()
                    case[case_name] = [case_id, count, metadata['frontend_url'], metadata['decision_date']]
                except Exception as e:
                    print('exception::',e, case_id)
                    pass
                jur_data.append(case)
            fixed_data[jur] += jur_data
            print('added', jur)
        with open(os.path.join('./sorted-citations-with-date', str(year) + '.json'), "w") as f:
            json.dump(fixed_data, f)
            print('-=-=-=-=-=-=-=-=-', year, '-=-=-=-=-=-=-=-=-')
    except Exception as e:
        print(e)
        pass

# for year in range(earliest_year, latest_year + 1):
#     try:
#         with open(os.path.join('./sorted-citations-short-per-jur', str(year) + '.json'), "r") as f:
#             ordered_cases = json.load(f)
#         for jur in ordered_cases:
#             if jur == 'U.S.':
#                 # US screws up the count
#                 continue
#
#             # ordered_cases[jur] = pre_sorted_cases[:11]  # <-- top 10 including count
#             for case in ordered_cases[jur][1:]:
#                 # print(case)
#                 case_name = list(case.keys())[0]
#                 case_id, count = case[case_name]
#                 metadata = requests.get("https://api.case.law/v1/cases/" + case_id).json()
#                 case[case_name] = [case_id, count, metadata['frontend_url'], metadata['decision_date']]
#                 # # frontend_url
#                 # # decision_date
#                 # # break
#         # print(ordered_cases)
#         with open(os.path.join('./sorted-citations-with-date', str(year) + '.json'), "w") as f:
#             json.dump(ordered_cases, f)
#     except Exception as e:
#         print(e)
#         pass

# -------> find most cited every year
for year in range(earliest_year, latest_year + 1):
    try:
        with open(os.path.join('./sorted-citations-with-date', str(year) + '.json'), "r") as f:
            ordered_cases = json.load(f)
        top_cases = []
        for jur in ordered_cases:

            ordered_cases[jur] = ordered_cases[jur][1:]
            for idx, case in enumerate(ordered_cases[jur]):
                key = list(ordered_cases[jur][idx].keys())[0]
                ordered_cases[jur][idx][key] = ordered_cases[jur][idx][key] + [jur]
            top_cases += ordered_cases[jur]

        top_cases = sorted(top_cases, key=lambda case: list(case.values())[0][1], reverse=True)
        top_cases = top_cases[:5]
        with open(os.path.join('./top-cases-per-year', str(year) + '.json'), "w") as f:
            json.dump(top_cases, f)
    except Exception as e:
        print(e)
        pass
