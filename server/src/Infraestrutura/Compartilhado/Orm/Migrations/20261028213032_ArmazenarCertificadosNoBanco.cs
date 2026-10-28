using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace GeradorCertificadosOnline.Infraestrutura.Compartilhado.Orm.Migrations
{
    /// <inheritdoc />
    public partial class ArmazenarCertificadosNoBanco : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "CaminhoZip",
                table: "ProcessamentosCertificados");

            migrationBuilder.DropColumn(
                name: "CaminhoArquivo",
                table: "Certificados");

            migrationBuilder.AddColumn<byte[]>(
                name: "ConteudoZip",
                table: "ProcessamentosCertificados",
                type: "bytea",
                nullable: true);

            migrationBuilder.AddColumn<byte[]>(
                name: "ConteudoPdf",
                table: "Certificados",
                type: "bytea",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "ConteudoZip",
                table: "ProcessamentosCertificados");

            migrationBuilder.DropColumn(
                name: "ConteudoPdf",
                table: "Certificados");

            migrationBuilder.AddColumn<string>(
                name: "CaminhoZip",
                table: "ProcessamentosCertificados",
                type: "character varying(500)",
                maxLength: 500,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "CaminhoArquivo",
                table: "Certificados",
                type: "character varying(500)",
                maxLength: 500,
                nullable: true);
        }
    }
}
