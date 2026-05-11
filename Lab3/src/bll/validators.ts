export class Validator {
  static requireNonEmpty(value: string, field: string) {
    if (!value.trim()) throw new Error(`${field} не може бути порожнім`);
  }

  static requirePositive(value: number, field: string) {
    if (value <= 400) throw new Error(`${field} має бути > 400`);
  }
}