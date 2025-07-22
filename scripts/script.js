$(() => {

    // #region Functions

    function getBibleTranslations() {
        fetch('https://api.scripture.api.bible/v1/bibles?language=eng', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'api-key': 'c8150c48771369bdb60fb40f09f9f856'
            }
        }).then(response => response.json())
        .then(data => {
            let unique = data.data.filter((value, index, self) => {});
            $.each(data.data, (index, translation) => {
                console.log(translation.abbreviationLocal, translation.name);
                $('#bible_translation_select').append(
                    `<option value="${translation.id}">${translation.abbreviationLocal} - ${translation.name}</option>`
                );
            });
        }).catch(error => {
            console.error('Error fetching translations:', error);
        });


    }

    async function searchBible(filter) {
        if (!filter) {
            filter = '';
        }

        let response = await fetch(`https://api.bible.com/v1/bible/search?query=${filter}`)
            .then(response => response.json());

        let results = JSON.parse(response);

        if (results) {
            console.log(results);
        }
    };

    // #endregion


    // #region Initialization
    getBibleTranslations();
    //searchBible('');

    // #endregion

});