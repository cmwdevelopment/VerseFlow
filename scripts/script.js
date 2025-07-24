$(() => {

    // #region Functions

    function getBibleTranslations() {
        $("#bible_translation_select").empty();


        fetch(`https://bible.helloao.org/api/available_translations.json`)
            .then(request => request.json())
            .then(data => {
                let translations = data.translations;
                let sortedTranslations = [];
                $.each(translations, (index, translation) => {
                    if (translation.language === 'eng') {
                        sortedTranslations.push(translation);
                    }
                });

                sortedTranslations.sort((a, b) => a.name.localeCompare(b.name));
                $("#bible_translation_select").append(`<option value="" selected disabled>Select translation...</option>`);
                $("#bible_translation_comparison_select").append(`<option value="" selected disabled>Select translation...</option>`);
                $.each(sortedTranslations, (index, translation) => {
                    $('#bible_translation_select').append(
                        `<option value="${translation.id}">${translation.shortName} - ${translation.englishName}</option>`
                    );

                    $('#bible_translation_comparison_select').append(
                        `<option value="${translation.id}">${translation.shortName} - ${translation.englishName}</option>`
                    );
                });
            });

    }

    function getBibleBooks(translationId) { 
        $("#bible_book_select").empty();


        fetch(`https://bible.helloao.org/api/${translationId}/books.json`)
            .then(request => request.json())
            .then(data => {
                let books = data.books;
                $("#bible_book_select").append(`<option value="" selected disabled>Select book...</option>`);
                $.each(books, (index, book) => {
                    $('#bible_book_select').append(
                        `<option data-chapters-count="${book.numberOfChapters}" value="${book.id}">${book.name}</option>`
                    );
                });
            });
    }

    function getBibleChapters(chapterCount) {
        $("#bible_chapter_select").empty();
        $("#bible_chapter_select").append(`<option value="" selected disabled>Select chapter...</option>`);

        for (let i = 1; i <= chapterCount; i++) {
            $('#bible_chapter_select').append(
                `<option value="${i}">${i}</option>`
            );
        }
        
    }

    function getBibleVerses(translationId, bookId, chapterNumber, container) {
        $(`#${container}`).empty();

        fetch(`https://bible.helloao.org/api/${translationId}/${bookId}/${chapterNumber}.json`)
            .then(request => request.json())
            .then(data => {
                let content = data.chapter;
                let contentHtml = ``;

                $.each(content.content, (index, element) => {
                    if (element.type === 'verse') {
                        let verseHtml = `<span class="verse"><strong class="verse-number me-3">${element.number}</strong>`;
                        let contentArray = element.content;

                        if (contentArray.length > 0) {
                            if (typeof contentArray[0] === 'string') {
                                verseHtml += contentArray.join(' ');
                                verseHtml += `</span><br/><br/>`;
                                contentHtml += verseHtml;
                            }

                            else {
                                contentArray.forEach((item) => {
                                    if (Object.keys(item).includes('text')) {
                                        verseHtml += item.text;
                                    }
                                });
                                verseHtml += `</span><br/><br/>`;
                                contentHtml += verseHtml;
                            }
                        }
                        
                    } 
                    
                    else if (element.type.includes('subtitle')) {
                        contentHtml += `<h4 class="my-3">${element.content}</h4>`;
                    }
                });

                $(`#${container}`).html(contentHtml);
            });
    }

    function logHistory(translation, book, chapterNumber) {
        let history = localStorage.getItem('searchHistory');

        if (!history) {
            let historyArray = [];
            historyArray.push({
                Translation: translation,
                Book: book,
                ChapterNumber: chapterNumber,
                DateSearched: new Date().toISOString()
            });

            localStorage.setItem('searchHistory', JSON.stringify(historyArray));
        }

        else {
            let historyJSON = JSON.parse(history);
            historyJSON.push({
                Translation: translation,
                Book: book,
                ChapterNumber: chapterNumber,
                DateSearched: new Date().toISOString()
            });

            localStorage.setItem('searchHistory', JSON.stringify(historyJSON));
        }
    }

    function loadHistory() {
        $("#history_content").empty();
        $("#history_content").append(`<h4 class="mb-3">Search History</h4>`);
        let history = localStorage.getItem('searchHistory');

        if (history !== undefined && history !== null) {
            let historyJSON = JSON.parse(history);
            $.each(historyJSON, (index, item) => {
                let translation = item.Translation;
                let book = item.Book;
                let chapterNumber = item.ChapterNumber;

                $("#history_content").append(
                    `<div class="card card-body shadow-sm mb-2">
                        <strong>Translation:</strong> ${translation} <br/>
                        <strong>Book:</strong> ${book} <br/>
                        <strong>Chapter:</strong> ${chapterNumber}<br/>
                        <strong>Date Searched:</strong> ${new Date(item.DateSearched).toLocaleString().replace(',', '')}
                    </div>`);
            
             });
            }
    }

    function showAlert(message, type) {

        var content = `<div class="toast shadow-sm" role="alert" data-animation="true" aria-live="assertive">
                            <div class="toast-body text-white border-start border-5 border-${type}" style="background-color:#353535;" data-bs-theme="dark">
                                <span class="me-auto fw-bold">${(type == "danger" ? 'Error' : type == "warning" ? 'Warning' : type == "success" ? 'Success' : type == "primary" ? 'Info' : type)}</span>
                                <button type="button" class="btn-close btn-sm float-end f-12 me-2 ms-auto" data-bs-dismiss="toast" aria-label="Close"></button>
                                <br/>
                                <span class="f-12">${message}</span>
                            </div>
                        </div>`;



        $(".alert-toast").append(content);
        $(".alert-toast .toast:last-child").toast('show');

    }

    // #endregion


    // #region Initialization

    getBibleTranslations();
    loadHistory();

    // #endregion


    // #region Event Handlers

    $("#bible_translation_select").on("change", function () {
        let translationId = $(this).val();
        if (translationId) {
            getBibleBooks(translationId);
        }
    });

    $("#bible_book_select").on("change", function() {
        let bookId = $(this).val();
        let chaptersCount = $(this).find(':selected').data('chapters-count');
        if (bookId) {
            getBibleChapters(chaptersCount);
        }
    });

    $("#bible_chapter_select").on("change", function() { 
        let translationId = $("#bible_translation_select").val();
        let bookId = $("#bible_book_select").val();
        let chapterNumber = $(this).val();
        if (translationId && bookId && chapterNumber) {
            getBibleVerses(translationId, bookId, chapterNumber, "bible_content");
            logHistory($("#bible_translation_select option:selected").text(),
                $("#bible_book_select option:selected").text(),
                chapterNumber);
            loadHistory();
        }
    });

    $("#bible_content").on("mouseover", ".verse", function() {

        $(this).css({
            "border-bottom": "1px dotted #007bff",
            "cursor": "pointer"
        });
    });

    $("#bible_content").on("mouseout", ".verse", function() {
        $(this).css({
            "border-bottom": "none"
        });
    });

    $("#bible_content").on("dblclick", ".verse", function(e) {

        e.preventDefault;

        if ($(this).hasClass("highlight")) {
            $(this).removeClass("highlight");
        }

        else {
            $(this).addClass("highlight");
        }
        
    });

    $("#bible_content").on("click", ".verse", function(e) {

        let verseText = $(this).text();
        localStorage.setItem('selectedVerse', verseText);
        showAlert(`Verse "${verseText.substring(1, verseText.length)}" copied to clipboard!`, 'success');
    });

    $("#bible_compare_btn").on("click", function() { 
        $("#bible_content").removeClass("col-12").addClass("col-6");
        $("#bible_comparison_input_group").removeAttr("hidden"); 
        $("#bible_container > .row").append(`<div id="bible_comparison_content" class="col-6 mt-3"></div>`);

    });

    $("#bible_translation_comparison_select").on("change", function() {
        let translationId = $(this).val();
        let bookId = $("#bible_book_select").val();
        let chapterNumber = $("#bible_chapter_select").val();
        if (translationId && bookId && chapterNumber) {
            getBibleVerses(translationId, bookId, chapterNumber, "bible_container [id*='bible_comparison_content']");
        }
    });

    $("#bible_clear_btn").on("click", function() {
        $("#bible_content").removeClass("col-6").addClass("col-12");
        $("#bible_comparison_input_group").attr("hidden", "hidden");
        $("[id*='bible_comparison_content']").remove();
        $("#bible_translation_comparison_select").val("");
        $("#bible_chapter_select").val("");
        $("#bible_book_select").val("");
        $("#bible_translation_select").val("");
        $("#bible_content").empty();
    });

    $("#login_btn").on("click", function() {
        window.location.href = "index.html";
    });

    $("#logout_btn").on("click", function() { 
        window.location.href = "login.html";

    });

    // #endregion

});