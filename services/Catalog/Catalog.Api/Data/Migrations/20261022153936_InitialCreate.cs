using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace Catalog.Api.Data.Migrations
{
    /// <inheritdoc />
    public partial class InitialCreate : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "products",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Name = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    Description = table.Column<string>(type: "character varying(2000)", maxLength: 2000, nullable: false),
                    Category = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    Price = table.Column<decimal>(type: "numeric(10,2)", precision: 10, scale: 2, nullable: false),
                    Stock = table.Column<int>(type: "integer", nullable: false),
                    Rating = table.Column<int>(type: "integer", nullable: false),
                    ImageUrl = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_products", x => x.Id);
                    table.CheckConstraint("ck_products_price", "\"Price\" >= 0");
                    table.CheckConstraint("ck_products_rating", "\"Rating\" BETWEEN 1 AND 5");
                    table.CheckConstraint("ck_products_stock", "\"Stock\" >= 0");
                });

            migrationBuilder.InsertData(
                table: "products",
                columns: new[] { "Id", "Category", "Description", "ImageUrl", "Name", "Price", "Rating", "Stock" },
                values: new object[,]
                {
                    { 1, "Headsets", "Over-ear stereo headset with a detachable mic.", "Images/Products/headset.png", "Gaming Headset", 49.99m, 3, 40 },
                    { 2, "Headsets", "2.4 GHz wireless, 30-hour battery.", "Images/Products/headset.png", "Wireless Gaming Headset", 89.99m, 4, 25 },
                    { 3, "Headsets", "Virtual 7.1 surround with memory foam ear cushions.", "Images/Products/headset.png", "7.1 Surround Headset", 69.99m, 4, 18 },
                    { 4, "Headsets", "Lightweight wired headset for everyday play.", "Images/Products/headset.png", "Budget Gaming Headset", 24.99m, 2, 60 },
                    { 5, "Headsets", "Tournament-grade drivers and a broadcast mic.", "Images/Products/headset.png", "Pro Esports Headset", 149.99m, 5, 8 },
                    { 6, "Mice", "12,000 DPI optical sensor, RGB lighting.", "Images/Cart/mouse.png", "Gaming Mouse", 29.99m, 3, 75 },
                    { 7, "Mice", "Low-latency wireless with a 70-hour battery.", "Images/Cart/mouse.png", "Wireless Gaming Mouse", 59.99m, 4, 30 },
                    { 8, "Mice", "58 g honeycomb shell for fast flicks.", "Images/Cart/mouse.png", "Ultralight Mouse", 79.99m, 5, 12 },
                    { 9, "Mice", "12 programmable side buttons.", "Images/Cart/mouse.png", "MMO Gaming Mouse", 49.99m, 2, 20 },
                    { 10, "Controllers", "Bluetooth controller for PC and console.", "Images/Home/Controller.png", "Wireless Controller", 59.99m, 5, 50 },
                    { 11, "Controllers", "Remappable back paddles and trigger stops.", "Images/Home/Controller.png", "Pro Controller", 129.99m, 4, 10 },
                    { 12, "Controllers", "Plug-and-play USB controller.", "Images/Home/Controller.png", "Wired Controller", 29.99m, 2, 45 },
                    { 13, "Controllers", "Classic layout for emulators.", "Images/Home/Controller.png", "Retro Controller", 19.99m, 1, 35 },
                    { 14, "Consoles", "Disc edition with one controller.", "Images/Order/PS5.png", "PS5 Console", 499.99m, 5, 6 },
                    { 15, "Consoles", "All-digital, no disc drive.", "Images/Order/PS5.png", "PS5 Digital Edition", 449.99m, 4, 4 },
                    { 16, "Consoles", "Charges two controllers at once.", "Images/Order/PS5.png", "Console Charging Dock", 29.99m, 3, 40 },
                    { 17, "PCs", "Ryzen 5, RTX 4060, 16 GB RAM, 1 TB SSD.", "Images/Products/PC.png", "Starter Gaming PC", 799.99m, 3, 5 },
                    { 18, "PCs", "Ryzen 7, RTX 4070 Super, 32 GB RAM, 2 TB SSD.", "Images/Products/PC.png", "Performance Gaming PC", 1499.99m, 4, 3 },
                    { 19, "PCs", "Ryzen 9, RTX 4090, 64 GB RAM, 4 TB SSD.", "Images/Products/PC.png", "Ultimate Gaming PC", 2999.99m, 5, 2 },
                    { 20, "PCs", "Mini-ITX build that fits on a desk shelf.", "Images/Products/PC.png", "Compact Gaming PC", 999.99m, 2, 0 }
                });

            migrationBuilder.CreateIndex(
                name: "IX_products_Category",
                table: "products",
                column: "Category");

            migrationBuilder.CreateIndex(
                name: "IX_products_Name",
                table: "products",
                column: "Name");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "products");
        }
    }
}
