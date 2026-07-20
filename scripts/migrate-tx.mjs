import fs from 'fs'

const files = [
  'src/routes/admin/inventory.tsx',
  'src/routes/admin/index.tsx',
  'src/routes/admin/sell.tsx',
  'src/routes/admin/products.tsx',
  'src/routes/admin/orders.tsx',
  'src/routes/admin/customers.tsx',
  'src/routes/admin/settings.tsx',
  'src/routes/admin/labels.tsx',
  'src/routes/admin/catalog/products.tsx',
  'src/routes/admin/catalog/categories.tsx',
  'src/routes/admin/returns.tsx',
]

for (const f of files) {
  if (!fs.existsSync(f)) continue
  let c = fs.readFileSync(f, 'utf8')
  if (!c.includes('useI18n')) continue
  c = c.replace(/const \{ ([^}]+) \} = useI18n\(\)/g, (m, inner) =>
    inner.includes('tx') ? m : `const { ${inner}, tx } = useI18n()`
  )
  c = c.replace(/lang === 'en' \? '([^']*)' : '([^']*)'/g, "tx('$1', '$2')")
  c = c.replace(/lang === 'en' \? "([^"]*)" : "([^"]*)"/g, 'tx("$1", "$2")')
  c = c.replace(/lang === 'en' \? ([a-zA-Z0-9_?.]+) : ([a-zA-Z0-9_?.]+)/g, 'tx($1, $2)')
  fs.writeFileSync(f, c)
  console.log('updated', f)
}
