import React from 'react'
import Navbar from '../components/Navbar'
import Posts from '../components/Posts'
import { useLocation } from 'react-router-dom'
function Home() {

    const location = useLocation()

  return (
    <div>
    <Navbar  name = {location.state}/>
    <Posts />
    </div>
  )
}

export default Home