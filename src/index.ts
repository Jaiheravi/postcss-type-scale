import * as postcss from 'postcss'

interface Options {
    rootSelector: string,
    typeRatio: number,
    ratioProperty: string
}

const defaults = {
    rootSelector: ':root',
    typeRatio: 1.2,
    ratioProperty: '--type-ratio'
}

export = postcss.plugin('type-scale', (opts: Options = defaults) => {
    const options: Options = Object.assign(defaults, opts)

    return css => {
        const typeRatio: number = getTypeRatio(css, options)

        css.walkDecls('font-size', decl => {
            // Replace only if it's a unitless value
            if (/\d+$/.test(decl.value)) decl.value = getSize(decl.value, typeRatio)
        })
    }
})

function getTypeRatio (css, opts: Options): number {
    // Start with the default ratio
    let typeRatio: number = opts.typeRatio

    // Walk over all the root selectors
    css.walkRules(opts.rootSelector, rule => {

        // Omit the process if the selector is inside a print media query
        if (rule.parent && rule.parent.params === 'print') return

        // Walk over all the font-size rules
        rule.walkDecls(opts.ratioProperty, decl => {
            typeRatio = parseFloat(decl.value)
        })
    })

    return typeRatio
}

function getSize(val: string, ratio: number): string {
    return parseFloat(Math.pow(ratio, parseInt(val) - 2).toFixed(4)) + 'rem'
}
