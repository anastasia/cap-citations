const all_jurisdictions = [
    "Ala.", "Alaska", "Ariz.", "Ark.", "Cal.", "Colo.", "Conn.", "D.C.", "Del.", "Fla.", "Ga.", "Haw.", "Idaho", "Ill.", "Ind.", "Iowa", "Kan.", "Ky.", "La.", "Mass.", "Md.", "Me.", "Mich.", "Minn.", "Miss.", "Mo.", "Mont.", "N. Mar. I.", "N.C.", "N.D.", "N.H.", "N.J.", "N.M.", "N.Y.", "Navajo Nation", "Neb.", "Nev.", "Ohio", "Okla.", "Or.", "P.R.", "Pa.", "R.I.", "S.C.", "S.D.", "Tenn.", "Tex.", "Tribal", "Utah", "V.I.", "Va.", "Vt.", "W. Va.", "Wash.", "Wis.", "Wyo."
]

function cleanJurisdictionName(name) {
    return name.toLowerCase().split('.').join('').split(' ').join('-')
}

function setFillAndAttribute(jur, colorValue, count) {
    let mapJur = document.getElementById(jur)
    mapJur.children[0].style.fill = `rgba(255, 99, 71, ${colorValue})`
    mapJur.setAttribute('title', count)
}

function getData(year) {
    const errorDiv = document.getElementById("error");

    axios.get(`/data/${year}`)
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
        let cleaned_jur = ""
        for (const jur in data) {
            cleaned_jur = cleanJurisdictionName(jur);
            let val = data[jur][0] / highest_val
            try {
                setFillAndAttribute(cleaned_jur, val, data[jur][0])
            } catch {
            }
        }
        for (let i = 0; i < not_included_jurs.length; i++) {
            cleaned_jur = cleanJurisdictionName(not_included_jurs[i]);
            try {
                setFillAndAttribute(cleaned_jur, "0", "0")
            } catch {
            }

        }
        errorDiv.innerText = ""
    }).catch((err) => {
        errorDiv.innerText = "Data is not available for the selected year"
        let cleaned_jur, mapjur;
        for (let i = 0; i < all_jurisdictions.length; i++) {
            cleaned_jur = cleanJurisdictionName(all_jurisdictions[i]);
            try {
                setFillAndAttribute(cleaned_jur, "0", "0")
            } catch {
            }
        }

        return err
    })
}

document.addEventListener('DOMContentLoaded', function () {
    const slider = document.getElementById("timeline");
    const year = document.getElementById("year");
    year.innerText = slider.value;
    getData(slider.value)
    slider.onchange = function () {
        getData(this.value)
        year.innerText = this.value;
    }
});