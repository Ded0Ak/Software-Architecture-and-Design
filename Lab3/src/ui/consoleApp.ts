import { InMemoryDbContext } from "../dal/inMemoryDb";
import { UnitOfWork } from "../dal/unitOfWork";
import { ServiceCatalogService, PortfolioService, DesignOrderService } from "../bll/services";
import { OrderType, ServiceType } from "../dal/entities";
import * as readline from "readline";

type TableRow = Record<string, string | number | boolean>;

export class ConsoleApp {
  private db = new InMemoryDbContext();
  private uow = new UnitOfWork(this.db);

  private services = new ServiceCatalogService(this.uow);
  private portfolio = new PortfolioService(this.uow);
  private orders = new DesignOrderService(this.uow);

  private rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  async run(): Promise<void> {
    this.seed();

    console.log("ДИЗАЙН-СТУДІЯ:");
    let exit = false;

    while (!exit) {
      console.log(`
1. Переглянути послуги (звичайні)
2. Переглянути послуги (під ключ)
3. Пошук послуг за назвою
4. Переглянути портфоліо
5. Додати роботу в портфоліо
6. Оформити замовлення з каталогу
7. Оформити замовлення "під ключ"
8. Додати нову послугу
9. Переглянути всі замовлення
0. Вихід
`);

      const choice = await this.ask("Оберіть пункт меню: ");
      try {
        switch (choice.trim()) {
          case "1": this.viewServices(ServiceType.Regular); break;
          case "2": this.viewServices(ServiceType.Turnkey); break;
          case "3": await this.searchServices(); break;
          case "4": this.viewPortfolio(); break;
          case "5": await this.addPortfolio(); break;
          case "6": await this.createOrderFromCatalog(); break;
          case "7": await this.createTurnkeyOrder(); break;
          case "8": await this.addService(); break;
          case "9": this.viewOrders(); break;
          case "0": exit = true; break;
          default: console.log("Невідомий пункт меню"); break;
        }
      } catch (e: any) {
        console.log("Помилка:", e.message);
      }
    }

    this.rl.close();
  }

  private seed() {
    this.services.addService("Дизайн інтерфейсу сайту", 1200, ServiceType.Regular, this.db.generateId());
    this.services.addService("Інтер'єрна концепція", 2500, ServiceType.Regular, this.db.generateId());
    this.services.addService("Брендинг під ключ", 5000, ServiceType.Turnkey, this.db.generateId());

    this.portfolio.addPortfolioItem("Сучасна квартира", "Мінімалістичний інтер'єр", this.db.generateId());
  }

  private viewServices(type: ServiceType) {
    const list = this.services.getByType(type);
    if (!list.length) return console.log("Немає доступних послуг.");

    this.printTable("Послуги", list.map(s => ({
      ID: s.id,
      Назва: s.name,
      Ціна: s.price,
      Тип: this.formatServiceType(s.type)
    })));
  }

  private async searchServices() {
    const q = await this.ask("Введіть слово для пошуку: ");
    const result = this.services.searchByName(q);
    if (!result.length) return console.log("Нічого не знайдено.");

    this.printTable("Результати пошуку", result.map(s => ({
      ID: s.id,
      Назва: s.name,
      Ціна: s.price,
      Тип: this.formatServiceType(s.type)
    })));
  }

  private viewPortfolio() {
    const list = this.portfolio.getAll();
    if (!list.length) return console.log("Портфоліо порожнє.");

    this.printTable("Портфоліо", list.map(p => ({
      ID: p.id,
      Назва: p.title,
      Опис: p.description
    })));
  }

  private viewOrders() {
    const list = this.orders.getAll();
    if (!list.length) return console.log("Замовлень поки немає.");

    this.printTable("Замовлення", list.map(o => ({
      ID: o.id,
      Клієнт: o.clientName,
      Тип: this.formatOrderType(o.orderType),
      Сума: o.totalPrice,
      Виконано: this.formatCompleted(o.completed)
    })));
  }

  private async addPortfolio() {
    const title = await this.ask("Назва роботи: ");
    const desc = await this.ask("Опис роботи: ");
    const item = this.portfolio.addPortfolioItem(title, desc, this.db.generateId());
    this.printTable("Роботу додано до портфоліо", [{
      ID: item.id,
      Назва: item.title,
      Опис: item.description
    }]);
  }

  private async addService() {
    const name = await this.ask("Назва послуги: ");
    const price = Number(await this.ask("Ціна: "));
    const type = await this.ask("Тип (Звичайна/Під ключ): ");

    const parsedType = this.parseServiceType(type);
    const item = this.services.addService(name, price, parsedType, this.db.generateId());
    this.printTable("Послугу додано", [{
      ID: item.id,
      Назва: item.name,
      Ціна: item.price,
      Тип: this.formatServiceType(item.type)
    }]);
  }

  private async createOrderFromCatalog() {
    const client = await this.ask("Ім'я клієнта: ");
    const idsRaw = await this.ask("ID послуг (через кому): ");
    const ids = idsRaw.split(",").map(x => Number(x.trim())).filter(x => !isNaN(x));

    const order = this.orders.createOrderFromCatalog(client, ids, this.db.generateId());
    this.portfolio.addPortfolioItem(
      `Замовлення #${order.id}`,
      `Виконано для ${order.clientName}`,
      this.db.generateId()
    );
    this.printTable("Замовлення створено", [{
      ID: order.id,
      Клієнт: order.clientName,
      Тип: this.formatOrderType(order.orderType),
      Послуги: order.serviceIds.join(", "),
      Сума: order.totalPrice,
      Виконано: this.formatCompleted(order.completed)
    }]);
  }

  private async createTurnkeyOrder() {
    const client = await this.ask("Ім'я клієнта: ");
    const total = Number(await this.ask("Сума замовлення: "));
    const order = this.orders.createTurnkeyOrder(client, total, this.db.generateId());

    this.portfolio.addPortfolioItem(
      `Під ключ #${order.id}`,
      `Виконано для ${order.clientName}`,
      this.db.generateId()
    );
    this.printTable("Замовлення \"під ключ\" створено", [{
      ID: order.id,
      Клієнт: order.clientName,
      Тип: this.formatOrderType(order.orderType),
      Сума: order.totalPrice,
      Виконано: this.formatCompleted(order.completed)
    }]);
  }

  private ask(question: string): Promise<string> {
    return new Promise(resolve => this.rl.question(question, resolve));
  }

  private formatServiceType(type: ServiceType): string {
    switch (type) {
      case ServiceType.Turnkey: return "Під ключ";
      case ServiceType.Regular: return "Звичайна";
      default: return String(type);
    }
  }

  private formatOrderType(type: OrderType): string {
    switch (type) {
      case OrderType.Turnkey: return "Під ключ";
      case OrderType.FromCatalog: return "З каталогу";
      default: return String(type);
    }
  }

  private formatCompleted(value: boolean): string {
    return value ? "Так" : "Ні";
  }

  private parseServiceType(raw: string): ServiceType {
    const normalized = raw.trim().toLowerCase();
    if (normalized === "під ключ" || normalized === "під-ключ" || normalized === "turnkey") {
      return ServiceType.Turnkey;
    }
    return ServiceType.Regular;
  }

  private printTable(title: string, rows: TableRow[]) {
    console.log(`\n${title}`);
    const headers = Object.keys(rows[0]);
    const widths = headers.map(h =>
      Math.max(
        h.length,
        ...rows.map(r => String(r[h]).length)
      )
    );

    const headerLine = headers.map((h, i) => h.padEnd(widths[i])).join(" | ");
    const sepLine = widths.map(w => "-".repeat(w)).join("-+-");

    console.log(headerLine);
    console.log(sepLine);

    for (const row of rows) {
      const line = headers
        .map((h, i) => String(row[h]).padEnd(widths[i]))
        .join(" | ");
      console.log(line);
    }
    console.log();
  }
}