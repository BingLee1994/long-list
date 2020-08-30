(function () {

    let template = `
        <div :class="{
            'list-item': true,
            selected: selected
        }">
            <span v-for="(val, key) in data" class="field" :class="key | styleFormat(val)">
                {{val | format(key)}}
            </span>
        </div>
    `

    Vue.component(
        'list-item',
        {
            template,
            props: {
                data: {
                    type: Object,
                    required: true
                },
                selected: Boolean
            },
            filters: {
                format(val, key) {
                    const formaters = {
                        default(val) {
                            return val
                        },
                        code(val) {
                            return '0'.repeat(6 - String(val).length) + val
                        },
                        increaseRate(val) {
                            return val + '%'
                        },
                        total(val) {
                            return val + '亿'
                        }
                    }

                    let formater = formaters[key] || formaters['default']
                    return formater(val)
                },
                styleFormat(key, val) {
                    const formaters = {
                        default() {
                            return ''
                        },
                        increaseRate(val) {
                            return val > 0 ? 'increase' : 'decrease'
                        },
                        total() {
                            return 'amount'
                        }
                    }

                    let formater = formaters[key] || formaters['default']
                    return formater(val)
                }
            }
        }
    )
})()