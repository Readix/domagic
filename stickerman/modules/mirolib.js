/**
 * Стандартные значение из Миро
 */

let sticker = {
    colors: {
        all: [
            '#F5F6F8', '#FFF9B1', '#F5D128', '#FF9D48', '#D5F692',
            '#C9DF56', '#93D275', '#67C6C0', '#FFCEE0', '#EA94BB',
            '#BE88C7', '#F16C7F', '#A6CCF5', '#7B92FF', '#000000'
        ],
        default: '#FFF9B1'
    },
    getDefault: () => {
        return {
            id: '',
            x: 0,
            y: 0,
            text: '',
            color: '#FFF9B1',
            width: 199,
            height: 228,
            type: 'sticker'
        }
    }
}

module.exports = {
    sticker: sticker
}