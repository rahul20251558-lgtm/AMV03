const text = "equivalent to 5.0 mg Tibolone";
const strengthNum = 2.5;
console.log(text.replace(/(?:equivalent to|containing)\s*\d+(?:\.\d+)?\s*(?:mg|g)\s+([A-Za-z]+)/gi, `equivalent to ${Number(strengthNum) % 1 === 0 ? strengthNum + '.0' : strengthNum} mg $1`));
