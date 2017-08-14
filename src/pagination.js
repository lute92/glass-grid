let a = 5; //record_par_page
let b = 64; // data_count;
let c = parseInt(b % a == 0 ? b / a : (b / a) + 1); //num_of_pages
let d = 5; // num_of_page_to_show
let f = 1; //start_page_index;
let e = parseInt(f + (d - 1)); // end_page_index;
let g = 1; //last_clicked_page_index;

function getNextPaginationInfo() {
    if ((c - e) > 0) { // if still having pages i.e; (c - e) > 0
        f = e + 1; // update start_page_index
        e = (f + (d - 1)) <= c ? f + (d - 1) : (f + (c - f));
    }
    return {
        "start_page_index": f,
        "end_page_index": e
    };
}

function getPreviousPaginationInfo() {
    if ((f - d) > 0) { // if still have previous pages to go back (start_page_index- num_of_page_to_show) > 0
        f = f - d;
        e = f + (d - 1);
    }
    return {
        "start_page_index": f,
        "end_page_index": e
    };
}


function generatePaging(startPage, endPage) {
    let pages = parseInt(c);
    let paging_holder = document.getElementById("pages");
    let btnPrevious = document.createElement("a");
    let btnNext = document.createElement("a");

    btnPrevious.id = "btnPrevious";
    btnPrevious.innerHTML = "Previous";
    btnPrevious.href = "#";
    paging_holder.appendChild(btnPrevious);

    btnPrevious.addEventListener("click", function(e) {
        e.preventDefault();
        onPreviousClick(e.target.id);

    });

    for (let i = parseInt(startPage); i <= parseInt(endPage); i++) {
        let anchor = document.createElement("a");
        anchor.id = i;
        anchor.innerHTML = i;
        anchor.href = "#";
        paging_holder.appendChild(anchor);

        anchor.addEventListener("click", function(e) {
            e.preventDefault();
            onPageClick(e.target.id);
        })

    }

    btnNext.id = "btnNext";
    btnNext.innerHTML = "Next";
    btnNext.href = "#";
    paging_holder.appendChild(btnNext);

    btnNext.addEventListener("click", function(e) {
        e.preventDefault();
        onNextClick(e.target.id);
    }, );
}

function onPageClick(currentPageIndex) {
    g = currentPageIndex;
    updateDisplay(currentPageIndex);
}

function enablePreviousButton(hasPrevious) {
    if (hasPrevious) {
        document.getElementById("btnPrevious").style = "visibility:visible;";
    } else {
        document.getElementById("btnPrevious").style = "visibility:hidden;";
    }
}

function enableNextButton(hasNext) {
    if (hasNext) {
        document.getElementById("btnNext").style = "visibility:visible;";
    } else {
        document.getElementById("btnNext").style = "visibility:hidden;";
    }
}

function onPreviousClick() {
    var pages = getPreviousPaginationInfo();
    clearPaging();
    generatePaging(pages.start_page_index, pages.end_page_index);
    1 == pages.start_page_index ? enablePreviousButton(false) : enablePreviousButton(true);
}

function onNextClick() {
    var pages = getNextPaginationInfo();
    clearPaging();
    generatePaging(pages.start_page_index, pages.end_page_index);
    c == pages.end_page_index ? enableNextButton(false) : enableNextButton(true);

}

function clearPaging() {
    let paging = document.getElementById("pages");
    paging.innerHTML = "";
}

function updateDisplay(val) {
    document.getElementById("display_area").innerHTML = val;
}

function onLoad() {
    generatePaging(f, e);
    enablePreviousButton(false);
    e < c ? enableNextButton(true) : enableNextButton(false);

}

onLoad();