namespace GeradorCertificadosOnline.Dominio.Modulos.Certificados;

/// <summary>
/// Compacta os PDFs gerados em um único ZIP, em memória. Não há I/O de arquivo
/// nesta abstração: os bytes do PDF e do ZIP são persistidos como colunas bytea
/// no próprio banco pelo chamador.
/// </summary>
public interface ICertificadoStorage
{
    byte[] Compactar(IReadOnlyList<(Guid CertificadoId, byte[] ConteudoPdf)> certificados);
}
