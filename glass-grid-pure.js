class GlassGrid {
    constructor() {
        this.data = [];
        this.id = "";
        this.rowTemplateUrl = "/";
        this.rowTemplate = "";
        this.enableSearch = false;
        this.pageSize = 10; //record_par_page
        this.totalRecordCount = 0; // data_count;
        this.totalPages; // //num_of_pages
        this.numberOfVisiblePagination = 5; // num_of_page_to_show
        this.endPageIndex = 1; //end_page_index
        this.startPageIndex = 1; //start_page_index
        this._infiniteScroll = true;
        this._pagination = false;
        this.lastPage = 1;
    };

    /**Library Events */
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
        this.totalPages == pages.end_page_index ? this.enableNextButton(false) : this.enableNextButton(true);

    }
    onPageScroll() {
        let _this = this;
        this.lastPage += 1;

        _this.onPageChangeCallback().then((data) => {
            _this.data = data;
            return Promise.resolve(_this.appendRowTemplate());
        }).then(() => {
            _this.onRowDataBindCallback();
        })
    }

    onPageClick(lastPage) {
        let _this = this;
        this.lastPage = parseInt(lastPage);

        _this.onPageChangeCallback().then((data) => {
            _this.data = data;
            return Promise.resolve(_this.clearGridBody());
        }).then(() => {
            return Promise.resolve(_this.appendRowTemplate());
        }).then(() => {
            _this.onRowDataBindCallback();
        })

    }

    /**Events Callbacks*/

    onSearchSubmitCallback() {}
    onPageChangeCallback() {}
    onRowDataBindCallback() {}

    /**User Events */

    onSearchSubmit(callback) {
        onSearchSubmitCallback = callback;
    }

    onPageChange(callback) {
        this.onPageChangeCallback = callback;
    }

    onRowDataBind(callback) {
        this.onRowDataBindCallback = callback;
    }

    /**properties */
    get infiniteScroll() {
        return this._infiniteScroll;
    }

    set infiniteScroll(value) {
        this._infiniteScroll = value;
    }

    get pagination() {
        return this._pagination;
    }

    set pagination(value) {
        if (typeof(value) !== 'boolean') throw new TypeError("Expected Boolean value but passed: " + typeof(value));

        this._pagination = value;
        this.infiniteScroll = !value;

    }

    get totalPages() {
        return parseInt((this.totalRecordCount % this.pageSize) == 0 ? (this.totalRecordCount / this.pageSize) : (this.totalRecordCount / this.pageSize) + 1);
    }

    set totalPages(value) {
        this.totalPages = value;
    }


    /**Grid paging functions */

    getNextPaginationInfo() {

        if ((this.totalPages - this.endPageIndex) > 0) { // if still having pages i.e; (c - e) > 0
            this.startPageIndex = this.endPageIndex + 1; // update start_page_index
            this.endPageIndex = (this.startPageIndex + (this.numberOfVisiblePagination - 1)) <= this.totalPages ? this.startPageIndex + (this.numberOfVisiblePagination - 1) : (this.startPageIndex + (this.totalPages - this.startPageIndex));
        }
        return {
            "start_page_index": this.startPageIndex,
            "end_page_index": this.endPageIndex
        };

    }

    getPreviousPaginationInfo() {
        if ((this.startPageIndex - this.numberOfVisiblePagination) > 0) { // if still have previous pages to go back (start_page_index- num_of_page_to_show) > 0
            this.startPageIndex = this.startPageIndex - this.numberOfVisiblePagination;
            this.endPageIndex = this.startPageIndex + (this.numberOfVisiblePagination - 1);
        }
        return {
            "start_page_index": this.startPageIndex,
            "end_page_index": this.endPageIndex
        };
    }

    generatePaging(startPage, endPage) {
        //let pages = parseInt(this.totalPages);
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

    appendRowTemplate() {
        let grid = document.getElementById(this.id);
        let gridBody = grid.getElementsByClassName("grid-body")[0];
        this.data.forEach((value, index) => {
            gridBody.innerHTML += this.rowTemplate;
        });

    }

    clearPaging() {
        let container = document.getElementById(this.id);
        let pagingArea = container.getElementsByClassName("grid-paging")[0];
        pagingArea.innerHTML = "";
    }


    /**Library Main Functions */

    init() {
        try {
            this.createGridShell();
            if (this.pagination && this.infiniteScroll) {
                throw new Error("Only one of the (pagination and infiniteScroll) options can be set to 'true'.");
                return;
            }
            if (this.pagination) {
                if (this.totalPages < this.numberOfVisiblePagination) { //available page count is less then page_count_to_shown
                    this.endPageIndex = this.numberOfVisiblePagination - parseInt(this.totalPages - this.numberOfVisiblePagination);
                } else {
                    this.endPageIndex = this.numberOfVisiblePagination;
                }

                this.generatePaging(this.startPageIndex, this.endPageIndex);
                this.enablePreviousButton(false);
                this.endPageIndex < this.totalPages ? this.enableNextButton(true) : this.enableNextButton(false);

            } else if (this.infiniteScroll) {
                let _this = this;
                let grid = document.getElementById(this.id);
                let gridBody = grid.getElementsByClassName("grid-body")[0];
                gridBody.classList.add("infinite-scroll");
                gridBody.addEventListener('scroll', function() {
                    if (gridBody.scrollTop + gridBody.clientHeight >= gridBody.scrollHeight) {
                        _this.onPageScroll();
                    }
                })


            }

            this.getRowTemplate().then((rowTemplate) => {
                this.rowTemplate = rowTemplate;
                return Promise.resolve(this.appendRowTemplate());
            }).then(() => {
                this.onRowDataBindCallback();
            })

        } catch (err) {
            throw new Error(err);
        }

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

            if (this.pagination) {
                let pagingArea = document.createElement("div");
                pagingArea.className = "grid-paging";
                footerArea.appendChild(pagingArea);
            }

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

    clearGridBody() {
        let gridBody = document.getElementsByClassName("grid-body")[0];
        gridBody.innerHTML = "";
    }



}