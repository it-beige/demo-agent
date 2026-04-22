import { getEncodingNameForModel, getEncoding } from 'js-tiktoken'

const modelName = 'gpt2'
const encodingName = getEncodingNameForModel(modelName)
console.log(encodingName)

const enc = getEncoding(modelName)
console.log('Hello, world!', enc.encode('Hello, world!').length)
console.log('JavaScript', enc.encode('JavaScript').length)
console.log('TypeScript', enc.encode('TypeScript').length)
console.log('NestJS', enc.encode('NestJS').length)
