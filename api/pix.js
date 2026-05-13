
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { name, cpf, email, phone, amount, productName, referenceId } = req.body;

  try {
    const apiKey = process.env.PODPAY_API_KEY;
    if (!apiKey) {
      console.error("ERRO: Variável de ambiente PODPAY_API_KEY não configurada");
      return res.status(500).json({ error: 'Erro de configuração do servidor (Podpay API Key)' });
    }

    const orderReference = referenceId || `PEDIDO-${Date.now()}`;
    const amountInCents = Math.round(amount * 100);

    // Payload para Podpay
    const payload = {
      amount: amountInCents,
      description: productName || "Pedido Vapex",
      external_id: orderReference,
      payment_method: "pix",
      customer: {
        name: name,
        email: email,
        document: cpf.replace(/\D/g, ""),
        phone: phone.replace(/\D/g, ""),
      }
    };

    console.log(`Gerando PIX Podpay - Valor: ${amount} - Pedido: ${orderReference}`);

    const response = await fetch("https://api.podpay.app/v1/payments", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
        "X-Idempotency-Key": orderReference // Usando o ID do pedido como chave de idempotência
      },
      body: JSON.stringify(payload),
    });

    const responseData = await response.json();
    console.log("--- RESPOSTA PODPAY ---", responseData);

    if (response.ok) {
      // Mapeando a resposta da Podpay para o formato esperado pelo frontend
      return res.status(200).json({
        status: "success",
        transaction_id: responseData.id || responseData.transaction_id,
        reference: responseData.external_id || orderReference,
        pix_code: responseData.pix_code || responseData.copy_paste || responseData.code,
        pix_qr_code: responseData.pix_qr_code || responseData.qr_code || responseData.image_url,
        amount: amount,
      });
    } else {
      console.error("Erro na resposta da Podpay:", responseData);
      return res.status(400).json({
        error: responseData.message || responseData.error || "Falha ao processar o pagamento com Podpay"
      });
    }
  } catch (error) {
    console.error("Erro interno na API de PIX (Podpay):", error);
    return res.status(500).json({ error: error.message || "Erro interno do servidor" });
  }
}
