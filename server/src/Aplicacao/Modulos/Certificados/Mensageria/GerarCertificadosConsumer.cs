using GeradorCertificadosOnline.Dominio.Modulos.Certificados;
using MassTransit;
using Microsoft.Extensions.Logging;

namespace GeradorCertificadosOnline.Aplicacao.Modulos.Certificados.Mensageria;

public sealed record GerarCertificados(Guid CursoId, Guid ProcessamentoId);

/// <summary>
/// Processa o agregado inteiro. Falhas de um certificado não impedem os demais;
/// falhas de persistência e do ZIP propagam para o retry da mensagem.
/// </summary>
public sealed class GerarCertificadosConsumer(
    IRepositorioProcessamentoCertificados repositorioProcessamento,
    ICertificadoPdfGenerator geradorPdf,
    ICertificadoStorage certificadoStorage,
    ILogger<GerarCertificadosConsumer> logger) : IConsumer<GerarCertificados>
{
    public async Task Consume(ConsumeContext<GerarCertificados> context)
    {
        var mensagem = context.Message;
        var cancellationToken = context.CancellationToken;

        var processamento = await repositorioProcessamento.SelecionarPorIdAsync(
            mensagem.ProcessamentoId,
            cancellationToken);

        if (processamento is null)
        {
            logger.LogWarning(
                "Processamento {ProcessamentoId} não encontrado para o curso {CursoId}; mensagem ignorada.",
                mensagem.ProcessamentoId,
                mensagem.CursoId);
            return;
        }

        if (processamento.EstaFinalizado)
        {
            logger.LogInformation(
                "Processamento {ProcessamentoId} já foi concluído; mensagem ignorada.",
                processamento.Id);
            return;
        }

        if (processamento.Status == StatusProcessamento.Pendente)
        {
            processamento.IniciarGeracao();
            await repositorioProcessamento.SalvarAsync(processamento, cancellationToken);
        }

        foreach (var certificado in processamento.Certificados)
        {
            if (certificado.StatusGeracao != StatusGeracao.Pendente)
                continue;

            byte[] conteudoPdf;
            try
            {
                conteudoPdf = geradorPdf.Gerar(
                    certificado.NomeAluno,
                    processamento.Curso.Nome,
                    processamento.Curso.CargaHoraria,
                    processamento.Curso.DataConclusao);
            }
            catch (OperationCanceledException)
            {
                throw;
            }
            catch (Exception ex)
            {
                logger.LogError(
                    ex,
                    "Falha individual ao gerar o certificado {CertificadoId} do curso {CursoId}.",
                    certificado.Id,
                    processamento.CursoId);

                processamento.RegistrarFalha(certificado.Id);
                await repositorioProcessamento.SalvarAsync(processamento, cancellationToken);

                continue;
            }

            processamento.RegistrarSucesso(certificado.Id, conteudoPdf);
            await repositorioProcessamento.SalvarAsync(processamento, cancellationToken);
        }

        if (!processamento.TodosCertificadosProcessados || processamento.ConteudoZip is not null)
            return;

        var certificadosParaCompactar = processamento.Certificados
            .Where(c => c.StatusGeracao == StatusGeracao.Gerado)
            .Select(c => (c.Id, ConteudoPdf: c.ConteudoPdf!))
            .ToList();

        var conteudoZip = certificadoStorage.Compactar(certificadosParaCompactar);

        processamento.RegistrarZip(conteudoZip);

        await repositorioProcessamento.SalvarAsync(processamento, cancellationToken);

        logger.LogInformation(
            "Processamento {ProcessamentoId} concluído: {Gerados} gerado(s), {Falhas} falha(s).",
            processamento.Id,
            processamento.Gerados,
            processamento.Falhas);
    }
}
