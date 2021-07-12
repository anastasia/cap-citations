import os
import json
import plotly.graph_objects as go

for year in range(1768, 2019):
    try:
        with open(os.path.join('./sorted', str(year) + '.json')) as f:
            data = json.load(f)
        jurs = list(data.keys())
        vals = list(data.values())
        to_sort = []
        for i, j in enumerate(jurs):
            if jurs[i] != 'U.S.':
                to_sort.append([jurs[i], vals[i][0]])
        sorted_list = sorted(to_sort, key=lambda jur: jur[1], reverse=True)

        keys = map(lambda jur: jur[0], sorted_list)
        vals = map(lambda jur: jur[1], sorted_list)
        fig = go.Figure([go.Bar(
            x=list(keys), y=list(vals))],
            layout={'title': str(year),
                    'xaxis': {
                        'dtick': 1
                    },
                    })
        # fig.show()
        fig.write_image("../exports-no-us/%s.png" % year)
    except Exception as e:
        print(e)
        pass

