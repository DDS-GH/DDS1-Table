export const rndChr = () => {
  const alphabet = 'abcdefghijklmnopqrstuvwxyz';
  return alphabet[Math.floor(Math.random() * alphabet.length)].toUpperCase();
};
export const rndNum = (max = 90) => {
  return Math.floor(Math.random() * max) + 1;
};
export const dataNode = () => {
  const rn = rndNum(9999999999);
  return {
    data: [
      `${rn}`,
      '21484557350',
      'INGRAM MICRO JONESTOWN',
      rndChr() + rndChr() + rndNum() + rndNum(),
      `<tooltipplaceholder>${rn}</tooltipplaceholder>`,
      'Available to Print Labels',
    ],
    details: `
    <tableplaceholder>${rn}</tableplaceholder>
`,
  };
};
export const dataNodes = (min = 0, max = 10) => {
  if (min >= max) {
    min = 5;
    max = 10;
  }
  const n = [];
  for (let x = min; x < max; x++) {
    n.push(dataNode());
  }
  // n[0].data[0] = `1234567890`;
  // n[0].details = `Details 1234567890`;
  return n;
};

export const arrayRemove = (arr, value) => {
  return arr.filter(function (ele) {
    return ele !== value;
  });
};
