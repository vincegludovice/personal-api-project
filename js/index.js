const key = 'AIzaSyCRy-UawQ0p4Im16rxAipkOF6QOrFRxyfc';
var totalResults = 0;
const jsosn = (startIndex, term) => fetch(`https://www.googleapis.com/books/v1/volumes?q=${term}&printType=books&maxResults=10&startIndex=${startIndex}&key=${key}`).then(res => {
    if(!res.ok) throw Error(res.statusText)
    else return res
}).then(res => res.json());
const bookDet = isbn => fetch(`https://www.googleapis.com/books/v1/volumes?q=isbn:${isbn}&key=${key}`).then(res => {
    if(!res.ok) throw Error(res.statusText)
    else return res
}).then(res => res.json());
var page = 0;
var term = '';
var tot;
if (localStorage.getItem("readingList") === null) {
    var readingList = [];
    localStorage.setItem("readingList", JSON.stringify(readingList));
}
var readingList = JSON.parse(localStorage.getItem("readingList"));
document.addEventListener('DOMContentLoaded', function() {
    page = new URL(window.location.href).searchParams.get("page");
    if(page) window.location.href =  window.location.href.split("?")[0];
}, false);
function items(startIndex, term){
    startIndex = (startIndex >= 1) ? startIndex - 1 : 0;
    startIndex *= 10
    jsosn(startIndex, term).then(book => {
        document.getElementById('printHere').innerHTML = book.items.map(books =>  books.volumeInfo).map(booki => {
        var img = (booki.imageLinks) ? booki.imageLinks.thumbnail : '',
            title = booki.title,
            aut = (booki.authors) ? booki.authors[0] : '',
            desc = booki.description,
            year = (booki.publishedDate) ? booki.publishedDate.substring(0, 4) : '',
            isbn = (booki.industryIdentifiers) ? booki.industryIdentifiers[0].identifier : '';
         return `<div class="col m6 s12">
                                    <div class="card medium custom">
                                        <div class="card-content white-text">
                                            <div class="book">
                                                <div class="img">
                                                    <img src="${img}" alt='Image not available'>
                                                </div>
                                                <div class="info" data-isbn="${isbn}">
                                                    <h3>${(title) ? title : 'Title not available'}</h3>
                                                    <h6>by ${(aut) ? aut : 'Author not available'} ${(year) ? ' • ' + year : ''}</h6>
                                                    <p>${(desc) ? desc : 'Book Description not available'}</p>       
                                                    <div>
                                                        <button class="btn waves-effect waves-light right-align yellow black-text" id="readList">Add to My Reading List</button>
                                                        <button class="btn waves-effect waves-light right-align modal-trigger blue" data-target="modal2" id="preview">Preview</button>
                                                        <button class="btn waves-effect waves-light right-align modal-trigger" data-target="modal1" id="details">Details</button>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>`;
        }).join('');
        document.querySelectorAll(".book").forEach(function(el){
            el.addEventListener("mouseover", function(){
                this.children[0].style.boxShadow = "0px 7px 15px 1px rgba(0, 0, 0, 0.75)";
                this.children[1].style.backgroundColor = 'white'
            });
            el.addEventListener("mouseout", function(){
                this.children[0].style.boxShadow = "3px 3px 6px rgba(0,0,0,0.7),0px 0px 4px rgba(0,0,0,0.7)";
                this.children[1].style.backgroundColor = 'transparent'
            });
        });
        document.querySelectorAll(".info > p").forEach(el => new Dotdotdot(el))
        M.Modal.init(document.querySelectorAll('.modal'));
        document.querySelectorAll("#details").forEach(function(el){
            el.addEventListener("click", function(){
                var isbn = this.parentNode.parentNode.getAttribute('data-isbn');
                bookDet(isbn).then(det => det.items.map(deta => deta.volumeInfo).map(detai => {
                    document.getElementById('book-info').innerHTML = '';
                    var img = (detai.imageLinks) ? detai.imageLinks.thumbnail.replace('zoom=1', 'zoom=0') : '',
                        title = detai.title,
                        aut = (detai.authors) ? detai.authors.map(aut => `<li>&nbsp;&nbsp;${aut} </li>`).join('') : '',
                        rat = detai.averageRating,
                        totalRat = detai.ratingsCount,
                        lang = ISO6391.getName(detai.language),
                        pages = (detai.pageCount) ? ', ' + detai.pageCount + ' pages' : '',
                        desc = (detai.description) ? detai.description : '',
                        year = detai.publishedDate.substring(0, 4),
                        date = new Date(detai.publishedDate),
                        options = { year: 'numeric', month: 'long', day: 'numeric' },
                        pub = detai.publisher;
                    document.getElementById('book-info').innerHTML = `<div class="col s4 teal">
                                                                            <img src="${(img) ? img : ''}" alt='Image not available'>
                                                                        </div>
                                                                        <div class="col s8 info2">
                                                                            <a class="modal-close btn-floating btn-large waves-effect waves-light red close"><i class="material-icons">close</i></a>
                                                                            <h3>${(title) ? title : 'Title not available'}</h3>
                                                                            <h6>by <ul id="autho">${aut}</ul>${(year) ? ' • ' + year : ''}</h6>
                                                                            <h5>${(rat) ? 'Average Rating: '+rat +' • ': ''}${(totalRat)?totalRat+' ratings' : ''} </h5>
                                                                            <h5>${lang}${pages}</h5>
                                                                            <h5>${'Published '+date.toLocaleDateString("en-US", options)} by ${pub}</h5>
                                                                            <div>
                                                                                <p>${desc}</p>   
                                                                            </div>
                                                                        </div>`
                }));
            })
        });
        document.querySelectorAll("#preview").forEach(function(el){
            el.addEventListener("click", function(){
                var isbn = this.parentNode.parentNode.getAttribute('data-isbn'); 
                initialize(isbn);
                google.books.setOnLoadCallback(initialize); 
            })
        });
        document.querySelectorAll("#readList").forEach(function(el){
            el.addEventListener("click", function(){
                var isbn = this.parentNode.parentNode.getAttribute('data-isbn'); 
                if(!readingList.includes(isbn)){
                    readingList.push(isbn);
                    localStorage.setItem("readingList", JSON.stringify(readingList));
                    alert('Book added to your Reading List');
                }else alert('The Book you are trying to add is already in your Reading List')
            })
        });
        if(startIndex == 0) tot = (book.totalItems / 100) * 2;
        paginate(Math.floor(tot));
    })
}
google.books.load();
function alertNotFound() {
    alert("Could not embed the book!");
  }
function initialize(isbn) {
    var viewer = new google.books.DefaultViewer(document.getElementById('viewerCanvas'));
    viewer.load(isbn, alertNotFound);
} 
function paginate(lastPage){
    $('#pagination').materializePagination({
        align: 'center',
        lastPage:  lastPage,
        firstPage:  1,
        urlParameter: 'page',
        useUrlParameter: true,
        onClickCallback: function(requestedPage){
            $('#pagination').empty();
            items(requestedPage, term);
        }
    });
}
document.getElementById('sear').addEventListener("click", function(){
    term = document.getElementById('search').value;
    term = (term) ? term : '';
    $('#pagination').empty();
    str = term.replace(/\s+/g, '+');
    document.getElementById('printHere').innerHTML = ''
    items(page, str);
    document.getElementById('search').value = '';
});

var input = document.getElementById("myInput");
$("#search").bind("keyup", function(event) {
  if (event.keyCode === 13 && document.getElementById('search').value != '') {
    document.getElementById('sear').click();
  }
}); 
$(window).on('load', function(){ 
    $('body > .preloader-background').css('display', 'none');
  });
var _oldFetch = fetch; 
window.fetch = function(){
    var fetchStart = new Event( 'fetchStart', { 'view': document, 'bubbles': true, 'cancelable': false } );
    var fetchEnd = new Event( 'fetchEnd', { 'view': document, 'bubbles': true, 'cancelable': false } );
    var fetchCall = _oldFetch.apply(this, arguments);
    document.dispatchEvent(fetchStart);
    fetchCall.then(function(){
        document.dispatchEvent(fetchEnd);
    }).catch(function(){
        document.dispatchEvent(fetchEnd);
    });
    return fetchCall;
  };
  document.addEventListener('fetchStart', function() {
      $('.pre2').css('display', 'block');
  });
  document.addEventListener('fetchEnd', function() {
      $('.pre2').css('display', 'none');
  });

  $(document).ready(function(){
    // $('.tabs').tabs();
    $('.tabss').tabs();
  });
  document.getElementById("tab2").addEventListener("click", function(){
    document.getElementById("tab1").classList.remove("active");
    this.classList.add("active");
    readingList.forEach(function(isbn){
        document.getElementById('printHere2').innerHTML = ''
        bookDet(isbn).then(det => {
            det.items.map(deta => deta.volumeInfo).map(detai => {
            var img = (detai.imageLinks) ? detai.imageLinks.thumbnail : '',
                title = detai.title,
                aut = (detai.authors) ? detai.authors[0] : '',
                desc = detai.description,
                year = (detai.publishedDate) ? detai.publishedDate.substring(0, 4) : '',
                isbn = (detai.industryIdentifiers) ? detai.industryIdentifiers[0].identifier : '';
            document.getElementById('printHere2').innerHTML += `<div class="col m6 s12">
            <div class="card medium custom">
                <div class="card-content white-text">
                    <div class="book">
                        <div class="img">
                            <img src="${img}" alt='Image not available'>
                        </div>
                        <div class="info" data-isbn="${isbn}">
                            <h3>${(title) ? title : 'Title not available'}</h3>
                            <h6>by ${(aut) ? aut : 'Author not available'} ${(year) ? ' • ' + year : ''}</h6>
                            <p>${(desc) ? desc : 'Book Description not available'}</p>       
                            <div>
                                <button class="btn waves-effect waves-light right-align red" id="remove">Remove</button>
                                <button class="btn waves-effect waves-light right-align modal-trigger blue" data-target="modal2" id="preview">Preview</button>
                                <button class="btn waves-effect waves-light right-align modal-trigger" data-target="modal1" id="details">Details</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>`;
        })
        // document.querySelectorAll(".info > p").forEach(el => new Dotdotdot(el))
        M.Modal.init(document.querySelectorAll('.modal'));
        document.querySelectorAll(".book").forEach(function(el){
            el.addEventListener("mouseover", function(){
                this.children[0].style.boxShadow = "0px 7px 15px 1px rgba(0, 0, 0, 0.75)";
                this.children[1].style.backgroundColor = 'white'
            });
            el.addEventListener("mouseout", function(){
                this.children[0].style.boxShadow = "3px 3px 6px rgba(0,0,0,0.7),0px 0px 4px rgba(0,0,0,0.7)";
                this.children[1].style.backgroundColor = 'transparent'
            });
        });
        document.querySelectorAll("#preview").forEach(function(el){
            el.addEventListener("click", function(){
                var isbn = this.parentNode.parentNode.getAttribute('data-isbn'); 
                initialize(isbn);
                google.books.setOnLoadCallback(initialize); 
            })
        });
        document.querySelectorAll("#remove").forEach(function(el){
            el.addEventListener("click", function(){
                var isbn = this.parentNode.parentNode.getAttribute('data-isbn');
                if (confirm("Are you sure you want to delete this book in your reading list?")){
                    readingList.splice(readingList.indexOf(isbn), 1);
                    localStorage.setItem("readingList", JSON.stringify(readingList));
                    location.reload(); 
                }
            })
        });
        document.querySelectorAll("#details").forEach(function(el){
            el.addEventListener("click", function(){
                var isbn = this.parentNode.parentNode.getAttribute('data-isbn');
                bookDet(isbn).then(det => det.items.map(deta => deta.volumeInfo).map(detai => {
                    document.getElementById('book-info').innerHTML = '';
                    var img = (detai.imageLinks) ? detai.imageLinks.thumbnail.replace('zoom=1', 'zoom=0') : '',
                        title = detai.title,
                        aut = (detai.authors) ? detai.authors.map(aut => `<li>&nbsp;&nbsp;${aut} </li>`).join('') : '',
                        rat = detai.averageRating,
                        totalRat = detai.ratingsCount,
                        lang = ISO6391.getName(detai.language),
                        pages = (detai.pageCount) ? ', ' + detai.pageCount + ' pages' : '',
                        desc = (detai.description) ? detai.description : '',
                        year = detai.publishedDate.substring(0, 4),
                        date = new Date(detai.publishedDate),
                        options = { year: 'numeric', month: 'long', day: 'numeric' },
                        pub = detai.publisher;
                    document.getElementById('book-info').innerHTML = `<div class="col s4 teal">
                                                                            <img src="${(img) ? img : ''}" alt='Image not available'>
                                                                        </div>
                                                                        <div class="col s8 info2">
                                                                            <a class="modal-close btn-floating btn-large waves-effect waves-light red close"><i class="material-icons">close</i></a>
                                                                            <h3>${(title) ? title : 'Title not available'}</h3>
                                                                            <h6>by <ul id="autho">${aut}</ul>${(year) ? ' • ' + year : ''}</h6>
                                                                            <h5>${(rat) ? 'Average Rating: '+rat +' • ': ''}${(totalRat)?totalRat+' ratings' : ''} </h5>
                                                                            <h5>${lang}${pages}</h5>
                                                                            <h5>${'Published '+date.toLocaleDateString("en-US", options)} by ${pub}</h5>
                                                                            <div>
                                                                                <p>${desc}</p>   
                                                                            </div>
                                                                        </div>`
                }));
            })
        });
    });
    })
  })
  document.getElementById("tab1").addEventListener("click", function(){
    document.getElementById("tab2").classList.remove("active");
    this.classList.add("active");
  })