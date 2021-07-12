let states, slider, year, errorDiv, statesInfo, stateCitations, selectedState;

const all_jurisdictions = [
    "Ala.", "Alaska", "Ariz.", "Ark.", "Cal.", "Colo.", "Conn.", "D.C.", "Del.", "Fla.", "Ga.", "Haw.", "Idaho", "Ill.", "Ind.", "Iowa", "Kan.", "Ky.", "La.", "Mass.", "Md.", "Me.", "Mich.", "Minn.", "Miss.", "Mo.", "Mont.", "N. Mar. I.", "N.C.", "N.D.", "N.H.", "N.J.", "N.M.", "N.Y.", "Navajo Nation", "Neb.", "Nev.", "Ohio", "Okla.", "Or.", "P.R.", "Pa.", "R.I.", "S.C.", "S.D.", "Tenn.", "Tex.", "Tribal", "Utah", "V.I.", "Va.", "Vt.", "W. Va.", "Wash.", "Wis.", "Wyo."
]
translation = {
    "ala": "Alabama",
    "alaska": "Alaska",
    "ariz": "Arizona",
    "ark": "Arkansas",
    "cal": "California",
    "colo": "Colorado",
    "conn": "Connecticut",
    "dc": "District of Columbia",
    "dakota-territory": "Dakota Territory",
    "del": "Delaware",
    "fla": "Florida",
    "ga": "Georgia",
    "haw": "Hawaii",
    "idaho": "Idaho",
    "ill": "Illinois",
    "ind": "Indiana",
    "iowa": "Iowa",
    "kan": "Kansas",
    "ky": "Kentucky",
    "la": "Louisiana",
    "mass": "Massachusetts",
    "md": "Maryland",
    "me": "Maine",
    "mich": "Michigan",
    "minn": "Minnesota",
    "miss": "Mississippi",
    "mo": "Missouri",
    "mont": "Montana",
    "n-mar-i": "Northern Mariana Islands",
    "nc": "North Carolina",
    "nd": "North Dakota",
    "nh": "New Hampshire",
    "nj": "New Jersey",
    "nm": "New Mexico",
    "ny": "New York",
    "neb": "Nebraska",
    "nev": "Nevada",
    "ohio": "Ohio",
    "okla": "Oklahoma",
    "or": "Oregon",
    "pr": "Puerto Rico",
    "pa": "Pennsylvania",
    "ri": "Rhode Island",
    "sc": "South Carolina",
    "sd": "South Dakota",
    "tenn": "Tennessee",
    "tex": "Texas",
    "tribal": "Tribal Jurisdictions",
    "utah": "Utah",
    "vi": "Virgin Islands",
    "va": "Virginia",
    "vt": "Vermont",
    "w-va": "West Virginia",
    "wash": "Washington",
    "wis": "Wisconsin",
    "wyo": "Wyoming"
}

function cleanJurisdictionName(name) {
    return name.toLowerCase().split('.').join('').split(' ').join('-')
}

function setFillAndAttribute(jur, colorValue, count) {
    try {
        let mapJur = document.getElementById(jur)
        mapJur.children[0].style.fill = `rgba(255, 99, 71, ${colorValue})`
        mapJur.setAttribute('title', count)
    } catch {
        // do nothing, jurisdiction not able to be mapped
    }
}

function addCaseInfo(c, jur) {
    let a = document.createElement('a')
    let p = document.createElement('p')
    let span = document.createElement('span')
    let caseName = Object.keys(c)[0];
    span.innerText = `cited ${c[caseName][1]} times`
    p.setAttribute('class', `states-info ${jur}`)
    p.style.display = "none";
    a.setAttribute('href', 'https://case.law/v1/cases/' + c[caseName][0])
    a.innerText = caseName;
    p.append(a)
    p.append(span)
    stateCitations = document.getElementById('state-citations');
    stateCitations.append(p)
}

async function getData(year) {
    await axios.get(`/data/${year}`)
        .then((resp) => {
            return resp.data
        }).then((data) => {
            let not_included_jurs = all_jurisdictions.filter(x => !Object.keys(data).includes(x));
            let highest_val = 0
            for (const jur in data) {
                if (data[jur][0] > highest_val) {
                    highest_val = data[jur][0]
                }
            }
            let cleaned_jur = "";
            let cases, count, val;
            for (const jur in data) {
                cleaned_jur = cleanJurisdictionName(jur);
                count = data[jur][0]
                cases = data[jur].slice(1);
                val = count / highest_val
                setFillAndAttribute(cleaned_jur, val, count)
                cases.map(c => addCaseInfo(c, cleaned_jur));

            }
            for (let i = 0; i < not_included_jurs.length; i++) {
                cleaned_jur = cleanJurisdictionName(not_included_jurs[i]);
                setFillAndAttribute(cleaned_jur, "0", "0")
            }
            errorDiv.innerText = ""
        }).catch((err) => {
            errorDiv.innerText = "Data is not available for the selected year";
            errorDiv.style.display = "block";
            let cleaned_jur;
            for (let i = 0; i < all_jurisdictions.length; i++) {
                cleaned_jur = cleanJurisdictionName(all_jurisdictions[i]);
                setFillAndAttribute(cleaned_jur, "0", "0")
            }
            return err
        })
}

function displayInfo(jur) {
    let selectedJurInfo = document.getElementsByClassName(`states-info ${jur}`);
    for (let k = 0; k < selectedJurInfo.length; k++) {
        selectedJurInfo[k].style.display = 'block';
    }
    selectedState.setAttribute('class', jur);
    selectedState.innerText = translation[jur];
}

function hideInfo() {
    for (let j = 0; j < statesInfo.length; j++) {
        statesInfo[j].style.display = 'none';
    }
}

HTMLElement.prototype.empty = function () {
    this.innerHTML = '';
}

document.addEventListener('DOMContentLoaded', function () {
    states = document.getElementsByClassName('state');
    statesInfo = document.getElementsByClassName('states-info')
    slider = document.getElementById("timeline");
    year = document.getElementById("year");
    errorDiv = document.getElementById("error");
    selectedState = document.getElementById('selected-state');
    year.innerText = slider.value;
    getData(slider.value)

    slider.onchange = async function () {
        year.innerText = this.value;
        let jur = selectedState.getAttribute('class');
        stateCitations.empty();

        await getData(this.value)
        displayInfo(jur)

    }
    for (let i = 0; i < states.length; i++) {
        states[i].addEventListener('click', (el) => {
            hideInfo();
            let selectedJur = el.target.parentElement.id;
            displayInfo(selectedJur)
        })
    }
});