export function random(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1) + min);
}

export const randomAlphabet = (stringLength: number) => {
  let randomString = "";

  const rd = () => {
    let rd = random(65, 122);
    if (90 < rd && rd < 97) rd += 10;
    return rd;
  };

  while (stringLength--) randomString += String.fromCharCode(rd());
  return randomString;
};

export function escapeRegExp(keyword: string): string {
  return keyword.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
