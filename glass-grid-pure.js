class GlassGrid {

    constructor() {

        this.data = [];
        this.id = "";
        this.a = 3; //record_par_page
        this.b = 0; // data_count;
        this.c; // //num_of_pages
        this.d = 5; // num_of_page_to_show
        this.e = 1; //end_page_index
        this.f = 1; //start_page_index
        this.clickedPage = 1; //last_clicked_page_index;
        this.rowTemplateUrl = "/";
        this.rowTemplate = "";
        this.onRowDataBind = function() {};
        this.onPageChange = function() {};
    };

    /**properties */
    get c() {
        return parseInt((this.b % this.a) == 0 ? (this.b / this.a) : (this.b / this.a) + 1);
    }

    set c(value) {
        this.c = value;
    }


    /**Grid paging */

    getNextPaginationInfo() {

        if ((this.c - this.e) > 0) { // if still having pages i.e; (c - e) > 0
            this.f = this.e + 1; // update start_page_index
            this.e = (this.f + (this.d - 1)) <= this.c ? this.f + (this.d - 1) : (this.f + (this.c - this.f));
        }
        return {
            "start_page_index": this.f,
            "end_page_index": this.e
        };

    }

    getPreviousPaginationInfo() {
        if ((this.f - this.d) > 0) { // if still have previous pages to go back (start_page_index- num_of_page_to_show) > 0
            this.f = this.f - this.d;
            this.e = this.f + (this.d - 1);
        }
        return {
            "start_page_index": this.f,
            "end_page_index": this.e
        };
    }

    generatePaging(startPage, endPage) {
        //let pages = parseInt(this.c);
        let container = document.getElementById(this.id);
        let paging_holder = container.getElementsByClassName("grid-footer")[0].getElementsByClassName("grid-paging")[0];

        let btnPrevious = document.createElement("a");
        let btnNext = document.createElement("a");

        btnPrevious.id = "btnPrevious";
        btnPrevious.innerHTML = "Previous";
        btnPrevious.href = "#";
        paging_holder.appendChild(btnPrevious);

        let _this = this;

        btnPrevious.addEventListener("click", function(e) {
            e.preventDefault();
            _this.onPreviousClick(e.target.id);

        });

        for (let i = parseInt(startPage); i <= parseInt(endPage); i++) {
            let anchor = document.createElement("a");
            anchor.id = i;
            anchor.innerHTML = i;
            anchor.href = "#";
            anchor.className = "paging-button";
            paging_holder.appendChild(anchor);

            anchor.addEventListener("click", function(e) {
                e.preventDefault();
                _this.onPageClick(e.target.id);
            })

        }

        btnNext.id = "btnNext";
        btnNext.innerHTML = "Next";
        btnNext.href = "#";
        paging_holder.appendChild(btnNext);

        btnNext.addEventListener("click", function(e) {
            e.preventDefault();
            _this.onNextClick(e.target.id);
        });
    }

    onPageClick(clickedPage) {
        this.clickedPage = parseInt(clickedPage);
        this.clearGridBody();
        this.onPageChange().then(() => {
            this.appendRowTemplate();
            this.onRowDataBind();
        });


    }

    enablePreviousButton(hasPrevious) {
        if (hasPrevious) {
            document.getElementById("btnPrevious").style = "visibility:visible;";
        } else {
            document.getElementById("btnPrevious").style = "visibility:hidden;";
        }
    }

    enableNextButton(hasNext) {
        if (hasNext) {
            document.getElementById("btnNext").style = "visibility:visible;";
        } else {
            document.getElementById("btnNext").style = "visibility:hidden;";
        }
    }

    onPreviousClick() {
        var pages = this.getPreviousPaginationInfo();
        this.clearPaging();
        this.generatePaging(pages.start_page_index, pages.end_page_index);
        1 == pages.start_page_index ? this.enablePreviousButton(false) : this.enablePreviousButton(true);
    }

    onNextClick() {
        var pages = this.getNextPaginationInfo();
        this.clearPaging();
        this.generatePaging(pages.start_page_index, pages.end_page_index);
        this.c == pages.end_page_index ? this.enableNextButton(false) : this.enableNextButton(true);

    }

    clearPaging() {
        let container = document.getElementById(this.id);
        let pagingArea = container.getElementsByClassName("grid-paging")[0];
        pagingArea.innerHTML = "";
    }


    /**Grid Main */
    init() {

        return new Promise((resolve, reject) => {
            try {
                this.createGridShell();

                if (this.c < this.d) { //available page count is less then page_count_to_shown
                    this.e = this.d - parseInt(this.c - this.d);
                } else {
                    this.e = this.d;
                }

                this.generatePaging(this.f, this.e);
                this.enablePreviousButton(false);
                this.e < this.c ? this.enableNextButton(true) : this.enableNextButton(false);

                this.getRowTemplate().then((rowTemplate) => {
                    this.rowTemplate = rowTemplate;
                    this.appendRowTemplate();

                    resolve();
                })



            } catch (err) {
                reject(err);
            }
        });


    }

    generalAjax(url, dataType, method, payload) {
        return new Promise((resolve, reject) => {
            $.ajax({
                url: url,
                type: method,
                data: payload,
                success: function(data) {
                    resolve(data);
                },
                error: function(error) {
                    reject(error);
                }
            });
        });
    }

    createGridShell() {
        let container = document.getElementById(this.id);
        if (container !== undefined) {
            /*create heading area */
            let headingArea = document.createElement("div");
            headingArea.className = "grid-heading";
            container.appendChild(headingArea);

            /*create body area */
            let bodyArea = document.createElement("div");
            bodyArea.className = "grid-body";
            container.appendChild(bodyArea);

            /*create footer area */
            let footerArea = document.createElement("div");
            footerArea.className = "grid-footer";
            container.appendChild(footerArea);

            let pagingArea = document.createElement("div");
            pagingArea.className = "grid-paging";
            footerArea.appendChild(pagingArea);
        }
    }

    getRowTemplate() {

        return new Promise((resolve, reject) => {
            if (this.rowTemplateUrl !== null || this.rowTemplateUrl !== undefined) {

                this.generalAjax(this.rowTemplateUrl, "", "GET", null).then((htmlTemplate) => {
                    resolve(htmlTemplate);
                }).catch((error) => {
                    let err = new Error("Error getting row template.", error);
                    reject(err);
                });
            } else {
                let error = new Error("rowTemplateUrl property cannot be null");
                reject(error);
            }
        })

    }

    appendRowTemplate() {

        let gridBody = document.getElementsByClassName("grid-body")[0];
        gridBody.innerHTML = "";
        this.data.forEach((value, index) => {
            gridBody.innerHTML += this.rowTemplate;
        });
    }

    clearGridBody() {
        let gridBody = document.getElementsByClassName("grid-body")[0];
        gridBody.innerHTML = "";
    }

}