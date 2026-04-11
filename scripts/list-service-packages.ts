import { readdir } from 'node:fs/promises'

async function listDirectories(root: string): Promise<string[]> {
  try {
    const items = await readdir(root, { withFileTypes: true })
    return items.filter((item) => item.isDirectory()).map((item) => item.name).sort()
  } catch {
    return []
  }
}

async function main() {
  const services = await listDirectories('services')
  const packages = await listDirectories('packages')

  console.log('Services:')
  for (const name of services) {
    console.log(`- ${name}`)
  }

  console.log('Packages:')
  for (const name of packages) {
    console.log(`- ${name}`)
  }
}

void main()
