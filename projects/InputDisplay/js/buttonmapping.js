document.addEventListener('DOMContentLoaded', () => {
    const buttonMappings = {
        triangle: 'triangle',
        cross: 'cross',
        circle: 'circle',
        square: 'square'
    };

    const saveMappingButton = document.getElementById('saveMapping');

    if (localStorage.getItem('buttonMappings')) {
        Object.assign(buttonMappings, JSON.parse(localStorage.getItem('buttonMappings')));
    }

    function updateButtonMappings() {
        const mappingElements = document.querySelectorAll('.button-map');
        mappingElements.forEach(element => {
            const buttonId = element.id.replace('map', '').toLowerCase();
            buttonMappings[buttonId] = element.value;
        });
    }

    function saveMappings() {
        updateButtonMappings();
        localStorage.setItem('buttonMappings', JSON.stringify(buttonMappings));
        applyMappings();
    }

    function applyMappings() {
        Object.keys(buttonMappings).forEach(button => {
            const buttonElement = document.getElementById(button);
            if (buttonElement) {
                buttonElement.dataset.mappedButton = buttonMappings[button];
            }
        });
    }

    saveMappingButton.addEventListener('click', saveMappings);

    applyMappings();
});
