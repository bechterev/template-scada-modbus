export type GroupedObjects = { [key: string]: Array<any>};

export async function groupByProperty(arr: Array<any>, prop: string): Promise<GroupedObjects> {
  return arr.reduce((acc, obj) => {
    const key = obj[prop];
    if (!acc[key]) {
      acc[key] = [];
    }
    acc[key].push(obj);
    return acc;
  }, {} as GroupedObjects);
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