import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://cxnttdfwzyxlrdnzbysh.supabase.co'
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN4bnR0ZGZ3enl4bHJkbnpieXNoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzgwNDExMjEsImV4cCI6MjA5MzYxNzEyMX0.qW1F5YCRK450MZc3tTspkgi4yA4Q-mkybLxQT26HSu4'

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)
