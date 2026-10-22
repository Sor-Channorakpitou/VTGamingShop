using Catalog.Api.Products;

namespace Catalog.Api.Data;

// Starting catalog, applied through the initial migration.
// Images are the ones already shipped with the frontend.
public static class SeedData
{
    private const string Headset = "Images/Products/headset.png";
    private const string Pc = "Images/Products/PC.png";
    private const string Mouse = "Images/Cart/mouse.png";
    private const string Controller = "Images/Home/Controller.png";
    private const string Console = "Images/Order/PS5.png";

    public static readonly Product[] Products =
    [
        new() { Id = 1, Name = "Gaming Headset", Category = "Headsets", Price = 49.99m, Stock = 40, Rating = 3, ImageUrl = Headset,
            Description = "Over-ear stereo headset with a detachable mic." },
        new() { Id = 2, Name = "Wireless Gaming Headset", Category = "Headsets", Price = 89.99m, Stock = 25, Rating = 4, ImageUrl = Headset,
            Description = "2.4 GHz wireless, 30-hour battery." },
        new() { Id = 3, Name = "7.1 Surround Headset", Category = "Headsets", Price = 69.99m, Stock = 18, Rating = 4, ImageUrl = Headset,
            Description = "Virtual 7.1 surround with memory foam ear cushions." },
        new() { Id = 4, Name = "Budget Gaming Headset", Category = "Headsets", Price = 24.99m, Stock = 60, Rating = 2, ImageUrl = Headset,
            Description = "Lightweight wired headset for everyday play." },
        new() { Id = 5, Name = "Pro Esports Headset", Category = "Headsets", Price = 149.99m, Stock = 8, Rating = 5, ImageUrl = Headset,
            Description = "Tournament-grade drivers and a broadcast mic." },
        new() { Id = 6, Name = "Gaming Mouse", Category = "Mice", Price = 29.99m, Stock = 75, Rating = 3, ImageUrl = Mouse,
            Description = "12,000 DPI optical sensor, RGB lighting." },
        new() { Id = 7, Name = "Wireless Gaming Mouse", Category = "Mice", Price = 59.99m, Stock = 30, Rating = 4, ImageUrl = Mouse,
            Description = "Low-latency wireless with a 70-hour battery." },
        new() { Id = 8, Name = "Ultralight Mouse", Category = "Mice", Price = 79.99m, Stock = 12, Rating = 5, ImageUrl = Mouse,
            Description = "58 g honeycomb shell for fast flicks." },
        new() { Id = 9, Name = "MMO Gaming Mouse", Category = "Mice", Price = 49.99m, Stock = 20, Rating = 2, ImageUrl = Mouse,
            Description = "12 programmable side buttons." },
        new() { Id = 10, Name = "Wireless Controller", Category = "Controllers", Price = 59.99m, Stock = 50, Rating = 5, ImageUrl = Controller,
            Description = "Bluetooth controller for PC and console." },
        new() { Id = 11, Name = "Pro Controller", Category = "Controllers", Price = 129.99m, Stock = 10, Rating = 4, ImageUrl = Controller,
            Description = "Remappable back paddles and trigger stops." },
        new() { Id = 12, Name = "Wired Controller", Category = "Controllers", Price = 29.99m, Stock = 45, Rating = 2, ImageUrl = Controller,
            Description = "Plug-and-play USB controller." },
        new() { Id = 13, Name = "Retro Controller", Category = "Controllers", Price = 19.99m, Stock = 35, Rating = 1, ImageUrl = Controller,
            Description = "Classic layout for emulators." },
        new() { Id = 14, Name = "PS5 Console", Category = "Consoles", Price = 499.99m, Stock = 6, Rating = 5, ImageUrl = Console,
            Description = "Disc edition with one controller." },
        new() { Id = 15, Name = "PS5 Digital Edition", Category = "Consoles", Price = 449.99m, Stock = 4, Rating = 4, ImageUrl = Console,
            Description = "All-digital, no disc drive." },
        new() { Id = 16, Name = "Console Charging Dock", Category = "Consoles", Price = 29.99m, Stock = 40, Rating = 3, ImageUrl = Console,
            Description = "Charges two controllers at once." },
        new() { Id = 17, Name = "Starter Gaming PC", Category = "PCs", Price = 799.99m, Stock = 5, Rating = 3, ImageUrl = Pc,
            Description = "Ryzen 5, RTX 4060, 16 GB RAM, 1 TB SSD." },
        new() { Id = 18, Name = "Performance Gaming PC", Category = "PCs", Price = 1499.99m, Stock = 3, Rating = 4, ImageUrl = Pc,
            Description = "Ryzen 7, RTX 4070 Super, 32 GB RAM, 2 TB SSD." },
        new() { Id = 19, Name = "Ultimate Gaming PC", Category = "PCs", Price = 2999.99m, Stock = 2, Rating = 5, ImageUrl = Pc,
            Description = "Ryzen 9, RTX 4090, 64 GB RAM, 4 TB SSD." },
        new() { Id = 20, Name = "Compact Gaming PC", Category = "PCs", Price = 999.99m, Stock = 0, Rating = 2, ImageUrl = Pc,
            Description = "Mini-ITX build that fits on a desk shelf." },
    ];
}
