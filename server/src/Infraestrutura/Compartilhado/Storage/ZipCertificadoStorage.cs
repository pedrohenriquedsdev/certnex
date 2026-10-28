using System.IO.Compression;
using GeradorCertificadosOnline.Dominio.Modulos.Certificados;

namespace GeradorCertificadosOnline.Infraestrutura.Compartilhado.Storage;

/// <summary>
/// Compacta os PDFs em um ZIP em memória. Os bytes do PDF e do ZIP são persistidos
/// como colunas bytea pelo repositório — esta classe não grava nada em disco.
/// </summary>
public sealed class ZipCertificadoStorage : ICertificadoStorage
{
    public byte[] Compactar(IReadOnlyList<(Guid CertificadoId, byte[] ConteudoPdf)> certificados)
    {
        using var stream = new MemoryStream();

        using (var archive = new ZipArchive(stream, ZipArchiveMode.Create, leaveOpen: true))
        {
            foreach (var (certificadoId, conteudoPdf) in certificados)
            {
                var entry = archive.CreateEntry($"{certificadoId}.pdf", CompressionLevel.Optimal);
                using var entryStream = entry.Open();
                entryStream.Write(conteudoPdf);
            }
        }

        return stream.ToArray();
    }
}
