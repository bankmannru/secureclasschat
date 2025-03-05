
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const formData = await req.formData()
    const file = formData.get('file')
    const classId = formData.get('classId')
    const channelId = formData.get('channelId')
    const userId = formData.get('userId')

    if (!file || !classId || !channelId || !userId) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      )
    }

    // Create a Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || ''
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''
    const supabase = createClient(supabaseUrl, supabaseKey)

    // Get file extension and create unique filename
    const fileExt = file.name.split('.').pop()
    const fileName = `${crypto.randomUUID()}.${fileExt}`
    const filePath = `${classId}/${channelId}/${fileName}`

    // Upload file to storage
    const { data: storageData, error: storageError } = await supabase.storage
      .from('media')
      .upload(filePath, file, {
        contentType: file.type,
        upsert: false
      })

    if (storageError) {
      console.error('Storage error:', storageError)
      return new Response(
        JSON.stringify({ error: 'Failed to upload media', details: storageError }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      )
    }

    // Get public URL for the file
    const { data: publicUrlData } = supabase.storage
      .from('media')
      .getPublicUrl(filePath)

    const publicUrl = publicUrlData.publicUrl

    // Insert message with media information
    const { data: messageData, error: messageError } = await supabase
      .from('messages')
      .insert({
        user_id: userId,
        class_id: classId,
        channel_id: channelId,
        content: '',
        media_url: publicUrl,
        media_type: file.type
      })
      .select()

    if (messageError) {
      console.error('Message error:', messageError)
      return new Response(
        JSON.stringify({ error: 'Failed to create message with media', details: messageError }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      )
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        url: publicUrl, 
        message: messageData[0] 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    )
  } catch (error) {
    console.error('Unexpected error:', error)
    return new Response(
      JSON.stringify({ error: 'An unexpected error occurred', details: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }
})
