export async function groupByProperty<T>(arr: T[], prop: keyof T): Promise<Record<string, T[]>> {
  return arr.reduce((acc, obj) => {
    const key = obj[prop].toString();
    if (!acc[key]) {
      acc[key] = [];
    }
    acc[key].push(obj);
    return acc;
  }, {} as Record<string, T[]>);
}

export async function sortByProperty(array: any[], ...fields: string[]): Promise<any[]> {
    return array.sort((a, b) => {
      for (const field of fields) {
        if (a[field] < b[field]) {
          return -1;
        }
        if (a[field] > b[field]) {
          return 1;
        }
      }
      return 0;
    });
}