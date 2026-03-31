import { serve } from "https://deno.land/std@0.177.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { url } = await req.json();
    if (!url || typeof url !== 'string') {
      return new Response(JSON.stringify({ error: 'URL is required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Validate it's a Google Sheets URL
    if (!url.includes('docs.google.com/spreadsheets')) {
      return new Response(JSON.stringify({ error: 'URL deve ser de uma planilha do Google Sheets' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log('Fetching URL:', url);

    const response = await fetch(url, {
      headers: {
        'Accept': 'text/csv, text/plain, */*',
      },
    });

    if (response.status === 404) {
      return new Response(JSON.stringify({ 
        error: 'Planilha não encontrada (404). Verifique se ela está "Publicada na Web" (Arquivo → Compartilhar → Publicar na Web).' 
      }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (response.status === 403 || response.status === 401) {
      return new Response(JSON.stringify({ 
        error: 'Acesso negado. A planilha precisa estar "Publicada na Web" (não apenas compartilhada por link).' 
      }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (!response.ok) {
      return new Response(JSON.stringify({ 
        error: `Google retornou status ${response.status}. Verifique a URL e se a planilha está publicada.` 
      }), {
        status: response.status,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const text = await response.text();
    console.log('Fetched', text.length, 'chars');

    return new Response(text, {
      headers: { ...corsHeaders, 'Content-Type': 'text/plain; charset=utf-8' },
    });
  } catch (error) {
    console.error('Error fetching Google Sheet:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
