(function () {
    
    let { ceil, max, min, floor } = Math

    function throttle (cb, interval) {
        let lastTime = Date.now(), timer = null
        return function () {
            let now = Date.now()
            if (timer) {
                clearTimeout(timer)
            }
            if (now - lastTime >= interval) {
                cb.apply(null, ...arguments)
                lastTime = now
            }
            timer = setTimeout(function() {
                cb.apply(null, ...arguments)
            }, interval)
        }
    }
      

    let template = `
        <div
            class="ultra-list"
            ref="container"
        >   
            <div
                class="sub-wrapper"
                :style="{
                    padding: placeholderHeight
                }"
            >
                <slot :visibleItems="visibleItems" :selectedIdx="selectedIdx"></slot>
            </div>
        </div>
    `

    Vue.component(
        'ultra-list',
        {
            template,
            props: {
                items: {
                    type: Array,
                    required: true
                },
                itemHeight: {
                    required: true,
                    type: Number
                }
            },
            data() {
                return {
                    visibleLength: 0,
                    appendBufferLength: 5,
                    scrollTop: 0,
                    containerHeight: 0,
                    selectedIdx: 0
                }
            },
            computed: {
                listCeil() {
                    return max(
                        floor(this.scrollTop / this.itemHeight) - this.appendBufferLength,
                        0
                    );
                },
                listFloor() {
                    return min(
                        ceil(
                          (this.scrollTop + this.containerHeight) / this.itemHeight + this.appendBufferLength
                        ),
                        this.items.length
                    );
                },
                visibleItems() {
                    let { selectedIdx, listCeil, listFloor, items } = this
                    let hasSelectedItem = selectedIdx >= listCeil && selectedIdx <= listFloor
                    let visibleItems = items.slice(listCeil, listFloor).map(item => ({
                        data: (typeof item === 'object') ? { ...item } : item,
                        selected: false
                    }))
                    if (hasSelectedItem) {
                        visibleItems[selectedIdx - listCeil].selected = true
                    }
                    return visibleItems
                },
                placeholderHeight() {
                    return `${this.listCeil * this.itemHeight}px 0 ${max(
                        (this.items.length - this.listFloor) * this.itemHeight,
                        0
                    )}px 0`
                }
            },
            mounted() {
                this._checkScrollTop()
                this._enableListeners()
                this.visibleLength = ceil(this.containerHeight / this.itemHeight)
            },
            created() {
                this.onScroll = throttle(this.onScroll, 100)
                this.isFocusing = false
            },
            beforeDestroy() {
                let elContainer = this.$refs.container
                elContainer.removeEventListener('scroll', this.onScroll, {
                    passive: true
                })
                document.removeEventListener("scroll", this.onScroll)
            },
            methods: {
                _enableListeners() {
                    let elContainer = this.$refs.container
                    elContainer.addEventListener('scroll', this.onScroll, {
                        passive: true
                    })
                    document.addEventListener('keydown', this.moveByKey)
                },
                _checkScrollTop() {
                    let elContainer = this.$refs.container
                    if (elContainer.scrollHeight > elContainer.offsetHeight) {
                        this.scrollTop = elContainer.scrollTop
                    } else {
                        this.scrollTop = document.documentElement.scrollTop || document.body.scrollTop
                    }
                    this.containerHeight = elContainer.offsetHeight
                },
                moveByKey(e) {
                    e.preventDefault()
                    let step = 0
                    if (e.keyCode === 38) {
                        step = -1
                    }
                    if (e.keyCode === 40) {
                        step = 1
                    }
                    if (step) {
                        let currentIdx = this.selectedIdx + step
                        let elContainer = this.$refs.container
                        let currentCeil = ceil(elContainer.scrollTop / this.itemHeight)
                        let currentFloor = currentCeil + floor(elContainer.offsetHeight / this.itemHeight)

                        if (step < 0 && currentIdx < currentCeil) {
                            if (!(currentIdx >= this.listCeil && currentIdx <= this.listFloor)) {
                                this.$refs.container.scrollTop = currentIdx * this.itemHeight
                            } else {
                                this.$refs.container.scrollTop += step * this.itemHeight
                            }
                        } else if (step > 0 && currentIdx > currentFloor - 1) {
                            this.$refs.container.scrollTop += step * this.itemHeight
                        } else if (!(currentIdx >= this.listCeil && currentIdx <= this.listFloor)) {
                            this.$refs.container.scrollTop = currentIdx * this.itemHeight
                        }
                        this.selectedIdx = min(
                            this.items.length,
                            max(0, currentIdx)
                        )
                        this.$emit('change', this.selectedIdx)
                        this._checkScrollTop()
                    }
                },
                onScroll() {
                    this._checkScrollTop()
                }
            }
        }
    )
})()