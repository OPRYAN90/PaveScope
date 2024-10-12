import { NextResponse } from 'next/server'
import axios from 'axios'

const GOOGLE_MAPS_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const lat = searchParams.get('lat')
  const lng = searchParams.get('lng')

  if (!lat || !lng) {
    return NextResponse.json({ error: 'Latitude and longitude are required' }, { status: 400 })
  }

  if (!GOOGLE_MAPS_API_KEY) {
    return NextResponse.json({ error: 'Google Maps API key is not configured' }, { status: 500 })
  }

  try {
    const response = await axios.get(
      `https://maps.googleapis.com/maps/api/elevation/json?locations=${lat},${lng}&key=${GOOGLE_MAPS_API_KEY}`
    )
    return NextResponse.json(response.data)
  } catch (error) {
    console.error('Error fetching elevation:', error)
    return NextResponse.json({ error: 'Failed to fetch elevation data' }, { status: 500 })
  }
}