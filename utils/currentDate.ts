export function getNowDate() {
  const currentDate = new Date();
  return `${
    currentDate.getMonth() + 1
  }/${currentDate.getDate()}/${currentDate.getFullYear()}`;
}

export function getCurrentDate(dateString: string) {
  try {
    const [month, day, year] = dateString.split("/");
    return new Date(parseInt(year), parseInt(month), parseInt(day));
  } catch (error) {
    return new Date(1990, 1, 1);
  }
}

export function getNowDateFormatted() {
  return new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}
