Vue.config.productionTip=false
const app = new Vue({
    el: "#app",
    data() {
        return {
            archives: [],
            page:{
                currentArchives:[],
                enable:true,
                limit:20,
                current:0,
                max:0,
            },
            archive: {
                isShow: false,
                error:null,
                isLoading: true,
                title: "",
                date: "",
                nodes: []
            }
        }
    },
    /*
    [
        0,1,limit-1, current = 1
        3,4,5,current = 2
        6,7,archives.length-1 current = 3
    ]

    */
    methods: {
        getArchives() {
            fetch("index.json")
                .then(response => response.json())
                .then(  
                    data => {
                        this.archives = [...data.archives]
                        this.page.currentPage=1;
                        this.page.maxPage=Math.ceil(this.archives.length/this.page.limit)
                        this.page.currentArchives=[]
                        for(let i=0;i<this.archives.length;i++){
                            this.page.currentArchives.push(
                                this.archives[i]
                            )
                        }
                    }
                );
        },
        getArchive(archive, successCallback, errorCallback) {
            fetch(archive.URI)
                .then(response => {
                    if(response.ok){
                        return response.text()
                    }else{
                        errorCallback({
                            status:response.status,
                            statusText:response.statusText
                        });
                        return null;
                    }
                })
                .then(data => {
                    if(data){
                        this.parseArchive(data)
                        successCallback()
                    }
                })
        },
        parseArchive(originText) {
            const textNodes = originText.split("\r\n")
            //console.log(textNodes);
            if (originText.length === 0) {
                textNodes = originText.split("\n") // maybe using LF rather than CRLF
            }
            const regs = [{
                feature: "### ",
                style: "h3"
            }]
            //TODO R
            for (let node of textNodes) {
                if (node.length === 0) {
                    continue;
                } else if (node.startsWith("### ")) {
                    this.archive.nodes.push({
                        style: "h3",
                        text: node.substring(4)
                    })
                } else if (node.indexOf("##") === 0) {
                    this.archive.nodes.push({
                        style: "h2",
                        text: node.substring(2)
                    })
                } else if (node.indexOf("#") === 0) {
                    this.archive.nodes.push({
                        style: "h1",
                        text: node.substring(1)
                    })
                } else if (node.indexOf("+ ") === 0) {
                    this.archive.nodes.push({
                        style: "li",
                        text: node.substring(2)
                    })
                }else if (new RegExp("\!\\[\\](.)").test(node)===true) {
                    this.archive.nodes.push({
                        type:"img",
                        src: "assets/test.png",
                        alt:"test"
                    })
                }else if (new RegExp("\\[\.\](.)").test(node)===true) {
                    this.archive.nodes.push({
                        type:"link",
                        href: "assets/test.png",
                        linkText:"testTest"
                    })
                }
                else {
                    this.archive.nodes.push({
                        style: "p",
                        text: node
                    })
                }

            }

        },
        getArchiveDate(archive) {
            const dateString = archive.URI.split("/")[1].split(".")[0]
            const year = dateString.substring(0, 4)
            const month = dateString.substring(4, 6)
            const day = dateString.substring(6, 8)
            return `${year}/${month}/${day}`
        },
        openArchive(archive) {
            this.archive.nodes = []
            this.archive.isLoading = true
            this.archive.error = null
            this.archive.title=""
            this.archive.isShow = true
            this.archive.title = archive.URI.split("/")[1]
            this.getArchive(archive,
                () => {
                    this.archive.isLoading = false
                },
                (error) => {
                    this.archive.isLoading = false
                    this.archive.error = error
                })
        },
        handleArchiveClose(){
            this.closeArchive()
        },
        closeArchive() {
            this.archive.isShow = false
        },
        previousPage(){

        },
        nextPage(){
            
        }
    },
    mounted() {
        this.getArchives()
    }
})