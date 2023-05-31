document.querySelector('button').addEventListener('click', getFetch)

function getFetch() {
    const choice = document.querySelector('input').value.replaceAll(' ', '-').replaceAll('.', '').toLowerCase()
    const url = `https://pokeapi.co/api/v2/pokemon/${choice}`

    fetch(url)
        .then(res => res.json())
        .then(data => {
            const potentialPet = new PokeInfo (data.name, data.height, data.weight, data.types, data.sprites.other['official-artwork'].front_default, data.location_area_encounters)
            potentialPet.getTypes()
            potentialPet.isItHousePet()
            

            let decision = ''
            // if pokemon might be a housepet
            if(potentialPet.housepet) {
                decision = `This Pokemon is small enough, lught enough, and safe enough to be a good pet. You can find ${potentialPet.name} in the following location(s) :`
                potentialPet.encounterInfo()
                document.querySelector('.locations').innerText = ''
            } else {
                decision = `This Pokemon would not be a good pet because ${potentialPet.reason.join(' and ')}`
            }


            // write decision to DOM
            document.querySelector('h2').innerText = decision

            document.querySelector('img').src = potentialPet.image
        })
        .catch(err => {
            console.log(err);
        })
}


class Poke {
    constructor(name, height, weight, types, image) {
        this.name = name
        this.height = height
        this.weight = weight
        this.types = types
        this.image = image
        // additional that change in the future
        this.housepet = true
        this.reason = []
        this.typeList = []
    }
    // Adding type of pokemon to typeList array
    getTypes() {
        for(const item of this.types) {
            this.typeList.push(item.type.name)
        }
        console.log(this.typeList);
    }
    weightToKg(weight) {
        const pounds = weight / 4.536
        // from pounds to kg
        const kg = pounds * 0.45359237
        return kg.toFixed(1)
    }
    heightToCm(height) {
        return height * 10
    }

    isItHousePet() {
        const badTypes = ['fire', 'electric', 'fighting', 'poison', 'ghost', 'psychic']

        if(this.weightToKg(this.weight) > 180) {
            this.reason.push(`it is too heavy at ${this.weightToKg(this.weight)} kg`)
            this.housepet = false
        }
        if(this.heightToCm(this.height) > 200) {
            this.reason.push(`it is to tall at ${this.heightToCm(this.height)} cm`)
            this.housepet = false
        }
        if(badTypes.some(type => this.typeList.indexOf(type) >= 0)) {
            this.reason.push('it is too dangerous')
            this.housepet = false
        }
    }
}

// use Poke for little manipulation with location
class PokeInfo extends Poke {
    constructor(name, height, weight, types, image, location) {
        super(name, height, weight, types, image)
        this.locationURL = location
        this.locationList = []
        this.locationString = ''
    }

    encounterInfo() {
        fetch(this.locationURL)
            .then(res => res.json())
            .then(data => {
                console.log(data)
                // getting location almost the same as typelist
                for(const item of data) {
                    this.locationList.push(item.location_area.name)
                }
                let target = document.querySelector('.locations')
                target.innerText = this.locationCleanUp()
            })
            .catch(err => {
                console.log(`error ${err}`)
            })
    }
    // deleting dash in location and make big letter after space
    locationCleanUp() {
        const words = this.locationList.slice(0, 5).join(', ').replaceAll('-', ' ').split(' ') // getting 5 elements of location
        
        for(let i = 0; i < words.length; i++) {
            words[i] = words[i][0].toUpperCase() + words[i].slice(1)
        }
        
        return words.join(' ')
    }
}