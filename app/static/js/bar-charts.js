// document.addEventListener('DOMContentLoaded', function () {
function getData(year) {
    console.log(`/data/${year}`)
    axios.get(`/data/${year}`)
        .then((resp) => {
            return resp.data
        }).then((json) => {
        let keys = Object.keys(json)
        let fullVals = Object.values(json)
        let vals = []
        fullVals.forEach((val) => {
            vals.push(val[0])
        })
        console.log(vals)
        let data = [
            {
                x: keys,
                y: vals,
                type: 'bar',
            }
        ];
        let layout = {
            title: {
                text: year,
            },
        }
        Plotly.newPlot(`chart-${year}`, data, layout);
    })
}

document.addEventListener('DOMContentLoaded', function () {
    let parentEl = document.getElementsByTagName('body')[0]
    for (let i = 1768; i <= 2018; i++) {
        // do something here ...
        let div = document.createElement('div')
        div.setAttribute('id', `chart-${i}`)
        div.setAttribute('style', "width:700px;height:600px;")

        parentEl.appendChild(div);
        getData(i)

    }
}, false);
// .then((data) => {
//     let xAxis = []
//     let yAxis = []
//     console.log('hey!!!', data)
//     let id = undefined
//     for (let i = 0; i < data.length - 1; i++) {
//         id = Object.keys(data[i])[0]
//         console.log(data[i], id)
//         xAxis.push(data[i][id][0])
//         yAxis.push(data[i][id][1])
//     }
//     let plot = [
//         {
//             x: xAxis,
//             y: yAxis
//         },
//     ]
//     Plotly.newPlot('tester2', plot);
//     // charting New York plot
//     console.log(plot)
// })

// }, false);
