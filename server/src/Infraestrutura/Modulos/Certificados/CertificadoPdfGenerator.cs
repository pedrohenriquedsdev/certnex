using GeradorCertificadosOnline.Dominio.Modulos.Certificados;
using QuestPDF.Fluent;
using QuestPDF.Helpers;
using QuestPDF.Infrastructure;

namespace GeradorCertificadosOnline.Infraestrutura.Modulos.Certificados;

/// <summary>
/// Template fixo no código; templates customizáveis ficam fora do escopo da V1.
/// Paleta espelha o tema visual do client (violet/cyan sobre slate), definido em
/// client/src/app/**/*.html.
/// </summary>
public sealed class CertificadoPdfGenerator : ICertificadoPdfGenerator
{
    private const string CorVioleta = "#7C3AED";
    private const string CorVioletaEscura = "#5B21B6";
    private const string CorCiano = "#06B6D4";
    private const string CorTextoPrincipal = "#0F172A";
    private const string CorTextoSecundario = "#475569";
    private const string CorTextoSutil = "#64748B";
    private const string CorBordaSutil = "#E2E8F0";

    public byte[] Gerar(string nomeAluno, string nomeCurso, int cargaHoraria, DateOnly dataConclusao)
    {
        var documento = Document.Create(container =>
        {
            container.Page(page =>
            {
                page.Size(PageSizes.A4.Landscape());
                page.Margin(1.2f, Unit.Centimetre);
                page.DefaultTextStyle(x => x.FontFamily("Arial").FontSize(14).FontColor(CorTextoSecundario));

                page.Content()
                    .Border(2)
                    .BorderColor(CorVioleta)
                    .Padding(6)
                    .Border(1)
                    .BorderColor(CorCiano)
                    .AlignMiddle()
                    .Column(moldura =>
                    {
                        moldura.Item().Height(8).Row(faixa =>
                        {
                            faixa.RelativeItem().Background(CorVioleta);
                            faixa.RelativeItem().Background(CorCiano);
                        });

                        moldura.Item().PaddingVertical(26).PaddingHorizontal(48).Column(conteudo =>
                        {
                            conteudo.Spacing(12);

                            conteudo.Item().AlignCenter().Text("ACADEMIA DO PROGRAMADOR")
                                .FontSize(13).Bold().FontColor(CorCiano);

                            conteudo.Item().AlignCenter().Text("Certificado de Conclusão")
                                .FontSize(34).Bold().FontColor(CorVioletaEscura);

                            conteudo.Item().AlignCenter().Width(90).Height(3).Background(CorCiano);

                            conteudo.Item().PaddingTop(6).AlignCenter().Text("Certificamos que")
                                .FontSize(15).Italic().FontColor(CorTextoSutil);

                            conteudo.Item().AlignCenter().Text(nomeAluno)
                                .FontSize(28).Bold().FontColor(CorTextoPrincipal);

                            conteudo.Item().AlignCenter().Width(260).Height(1).Background(CorBordaSutil);

                            conteudo.Item().PaddingTop(4).AlignCenter().Width(520).Text(text =>
                            {
                                text.AlignCenter();
                                text.DefaultTextStyle(x => x.FontSize(15).FontColor(CorTextoSecundario));
                                text.Span("concluiu com êxito o curso ");
                                text.Span(nomeCurso).Bold().FontColor(CorVioletaEscura);
                                text.Span($", com carga horária de {cargaHoraria} horas, concluído em {dataConclusao:dd/MM/yyyy}.");
                            });

                            conteudo.Item().PaddingTop(18).Row(rodape =>
                            {
                                rodape.RelativeItem().Column(esquerda =>
                                {
                                    esquerda.Item().Text("DATA DE CONCLUSÃO")
                                        .FontSize(10).Bold().FontColor(CorTextoSutil);
                                    esquerda.Item().PaddingTop(2).Text(dataConclusao.ToString("dd/MM/yyyy"))
                                        .FontSize(14).Bold().FontColor(CorTextoPrincipal);
                                });

                                rodape.ConstantItem(1).Background(CorBordaSutil);

                                rodape.RelativeItem().AlignRight().Row(selo =>
                                {
                                    selo.AutoItem().Column(texto =>
                                    {
                                        texto.Item().AlignRight().Text("Academia do Programador")
                                            .FontSize(13).Bold().FontColor(CorVioleta);
                                        texto.Item().AlignRight().Text("Certificado emitido digitalmente")
                                            .FontSize(9).FontColor(CorTextoSutil);
                                    });

                                    selo.ConstantItem(16);

                                    selo.ConstantItem(48).Height(48)
                                        .Background(CorCiano).CornerRadius(24)
                                        .Padding(3)
                                        .Background(CorVioleta).CornerRadius(21)
                                        .AlignCenter().AlignMiddle()
                                        .Text("AP").FontSize(16).Bold().FontColor(Colors.White);
                                });
                            });
                        });

                        moldura.Item().Height(8).Row(faixa =>
                        {
                            faixa.RelativeItem().Background(CorCiano);
                            faixa.RelativeItem().Background(CorVioleta);
                        });
                    });
            });
        });

        return documento.GeneratePdf();
    }
}
