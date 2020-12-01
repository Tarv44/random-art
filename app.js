'use strict'
const columnsTotal = 85
const rowsTotal = 40
const totalCells = columnsTotal * rowsTotal
let totalFilled = 0

let sameChance
let skewChance
let newChance
let startingNodes

const STORE = {};

let storeKeys


/* -------------- Render Empty Grid -------------- */


function generateCell(columnIndex, index) {
    const rowIndex = index + 1
    const id = `c${columnIndex}r${rowIndex}`
    STORE[id] = {column: columnIndex, row: rowIndex, filled: false}
    return `<div id=${id} data-column=${columnIndex} data-row=${rowIndex} data-filled=false class="cell"></div>`
}

function generateSingleColumn(index) {
    const columnIndex = index + 1
    let column = ``;
    for (let i = 0; i < rowsTotal; i++) {
        column += generateCell(columnIndex, i);
    }
    return `<div id="column${columnIndex}" class="column">${column}</div>`
}

function generateColumns() {
    let columns = ``;
    for (let i = 0; i < columnsTotal; i++) {
        columns += generateSingleColumn(i);
    }
    return columns
}

function generateGrid() {
    const columns = generateColumns();
    return `<div class="grid">${columns}</div>`
}

function renderGrid() {
    const grid = generateGrid();
    storeKeys = Object.keys(STORE)
    $('#app').html(grid);
}




/* -------------- Random Color Fill -------------- */

function getSurroundingIDs(c, r) {
    const surroundingIDs = []
    if (c === 1) {
        if (r === 1) {
            surroundingIDs.push(`c${c}r${r+1}`, `c${c+1}r${r}`, `c${c+1}r${r+1}`)
        } else if (r === rowsTotal) {
            surroundingIDs.push(`c${c}r${r-1}`, `c${c+1}r${r-1}`, `c${c+1}r${r}`)
        } else {
            surroundingIDs.push(`c${c}r${r-1}`, `c${c}r${r+1}`, `c${c+1}r${r-1}`, `c${c+1}r${r}`, `c${c+1}r${r+1}`)
        }
    } else if (c === columnsTotal) {
        if (r === 1) {
            surroundingIDs.push(`c${c-1}r${r}`, `c${c-1}r${r+1}`, `c${c}r${r+1}`)
        } else if (r === rowsTotal) {
            surroundingIDs.push(`c${c-1}r${r-1}`, `c${c-1}r${r}`, `c${c}r${r-1}`)
        } else {
            surroundingIDs.push(`c${c-1}r${r-1}`, `c${c-1}r${r}`, `c${c-1}r${r+1}`, `c${c}r${r-1}`, `c${c}r${r+1}`)
        }
    } else {
        if (r === 1) {
            surroundingIDs.push(`c${c-1}r${r}`, `c${c+1}r${r}`, `c${c-1}r${r+1}`, `c${c}r${r+1}`, `c${c+1}r${r+1}`)
        } else if (r === rowsTotal) {
            surroundingIDs.push(`c${c-1}r${r-1}`, `c${c}r${r-1}`, `c${c+1}r${r-1}`, `c${c-1}r${r}`, `c${c+1}r${r}`)
        } else {
            surroundingIDs.push(`c${c-1}r${r-1}`, `c${c-1}r${r}`, `c${c-1}r${r+1}`, `c${c}r${r-1}`, `c${c}r${r+1}`, `c${c+1}r${r-1}`, `c${c+1}r${r}`, `c${c+1}r${r+1}`)
        }
    }
    return surroundingIDs
}

function getSurroundingColors(column, row) {
    const surroundingColors = [];
    const surroundingIDs = getSurroundingIDs(column, row);
    for (let i = 0; i < surroundingIDs.length; i++) {
        const filled = STORE[surroundingIDs[i]].filled
        if (filled === true) {
            const colorInfo = STORE[surroundingIDs[i]].colorInfo
            surroundingColors.push(colorInfo)
        }
    }
    return surroundingColors
}

function generateRandomID() {
    const randomID = storeKeys[Math.floor(Math.random()*storeKeys.length)]
    return randomID
}

function generateRandomRGB() {
    function random(range) {
        return Math.floor(Math.random() * range);
    }

    const colorInfo = {};
    colorInfo.red = random(256)
    colorInfo.green = random(256)
    colorInfo.blue = random(256)
    colorInfo.rgb = `rgba(${colorInfo.red}, ${colorInfo.green}, ${colorInfo.blue}, 1)`

    return colorInfo
}



function skewColor(colorInfo) {
    const newColor = colorInfo;
    const redChange = (Math.floor(Math.random() * 10) + 1)
    const greenChange = (Math.floor(Math.random() * 10) + 1)
    const blueChange = (Math.floor(Math.random() * 10) + 1)

    if (Math.random() < .5) {
        newColor.red += redChange
        if (newColor.red > 255) {
            newColor.red = 255
        }
    } else {
        newColor.red -= redChange
        if (newColor.red < 0) {
            newColor.red = 0
        }
    }

    if (Math.random() < .5) {
        newColor.green += greenChange
        if (newColor.green > 255) {
            newColor.green = 255
        }
    } else {
        newColor.green -= greenChange
        if (newColor.green < 0) {
            newColor.green = 0
        }
    }

    if (Math.random() < .5) {
        newColor.blue += blueChange
        if (newColor.blue > 255) {
            newColor.blue = 255
        }
    } else {
        newColor.blue -= blueChange
        if (newColor.blue < 0) {
            newColor.blue = 0
        }
    }

    newColor.rgb = `rgba(${newColor.red}, ${newColor.green}, ${newColor.blue}, 1)`

    return newColor
}

function fillCellColor(cell, surroundingColors) {
    const probability = Math.random()
    const colorIndex = (Math.floor(surroundingColors.length * Math.random()))
    const colorSelect = surroundingColors[colorIndex]
    if (probability < sameChance) {
        $(`#${cell}`).css('background-color', colorSelect.rgb)
        STORE[cell].filled = true
        STORE[cell].colorInfo = colorSelect
    } else if (probability < skewChance) {
        const newColor = skewColor(colorSelect)
        $(`#${cell}`).css('background-color', newColor.rgb)
        STORE[cell].filled = true
        STORE[cell].colorInfo = newColor
    } else {
        const newColor = generateRandomRGB()
        $(`#${cell}`).css('background-color', newColor.rgb)
        STORE[cell].filled = true
        STORE[cell].colorInfo = newColor
    }
    
}


function randomFillCell() {
    const randomId = generateRandomID();
    const filled = STORE[randomId].filled
    if (!filled) {
        const column = STORE[randomId].column
        const row = STORE[randomId].row;
        const surroundingColors = getSurroundingColors(column, row)
        if (surroundingColors.length > 0) {
            fillCellColor(randomId, surroundingColors);
            storeKeys.splice(storeKeys.indexOf(randomId), 1);
        } 
    }
}

function fillRandomCell() {
    const randomId = generateRandomID();
    const colorInfo = generateRandomRGB();
    $(`#${randomId}`).css("background-color", colorInfo.rgb);
    STORE[randomId].filled = true;
    STORE[randomId].colorInfo = colorInfo;
    storeKeys.splice(storeKeys.indexOf(randomId),1)
}

function fillGrid() {
    for (let i = 0; i < startingNodes; i++) {
        fillRandomCell();
    }

    const fillDelay = setInterval(fillStop, 1)
    function fillStop() {
        if (storeKeys.length === 0){
            clearInterval(fillDelay)
            alert('All colors filled.')
        } else {
            randomFillCell();

        }
    }
}

function watchSubmit() {
    $('form').submit(event => {
        event.preventDefault()
        sameChance = Number($('#sameColor').val())
        skewChance = Number($('#skewColor').val())
        newChance = Number($('#newColor').val())
        startingNodes = Number($('#starting-nodes').val())
        fillGrid();
    })
}

function setupPage() {
    renderGrid()
    watchSubmit()
}

$(setupPage)