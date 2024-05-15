"use client"
import { useState } from "react";
import { Avatar, Button, Card, CardBody, Image, Input, Spinner } from "@nextui-org/react";
import { useEffect } from "react";
import { FaLink, FaSearch, FaTwitter } from "react-icons/fa";
import axios from "axios";
import { FaHouse, FaLocationPin } from "react-icons/fa6";
import { ThemeSwitcher } from "./ThemeSwitcher";

export default function Home() {
  const [search, setSearch] = useState('');
  const [userData, setUserData] = useState({
    avatar_url: '',
    name: '',
    bio: '',
    location: '',
    login: '',
    public_repos: 0,
    followers: 0,
    following: 0,
    created_at: '',
    twitter: '',
    blog: '',
    company: '',
  
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState({
    message: '',
  });
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = (e:any) => {
    e.preventDefault();
    setIsSubmitted(true);
    setLoading(true);
    axios.post('/api/search', { username: search })
      .then((res) => {
        setError({ message: '' });
        if(!res.data.login){
          setError({ message: 'Kullanıcı bulunamadı' });
        } 
        
        setUserData(res.data);
        setLoading(false);
      }).catch((err) => {
        setError(err);
        setLoading(false);
      })
  }
  
  return (
    <section className='flex flex-col gap-8 justify-center h-screen'>
      <div className='flex justify-between items-center w-full'>
        <h1 className="font-extrabold text-xl">czayfinder</h1>
        <ThemeSwitcher />
      </div>
      <div className="flex bg-gray-800 py-2 pl-4 pr-2 items-center gap-5 rounded-xl">
        <form className="flex justify-between w-full gap-5 items-center" onSubmit={handleSubmit}>
          <label htmlFor="search-github"><FaSearch className="text-blue-500 text-3xl" /></label>
          <input onChange={(e) => setSearch(e.target.value)} type="text" id="search-github" className="bg-gray-800 w-full text-white py-2 focus:outline-none" placeholder="Github kullanıcı adıyla arama yap..."/>
          <Button type="submit" color="primary" variant="shadow">Ara</Button>
        </form>
      </div>
      {isSubmitted && userData && (
        <Card className="bg-sky-900/40">
          <CardBody className="px-10 py-4">
              {error?.message ? (
                <h1>{error.message}</h1>
              ):(
                <div className="grid grid-cols-12 gap-6">
                  <div className="col-span-2">
                    <Avatar src={userData?.avatar_url} alt={userData.login} className="rounded-full min-w-20 h-20"/>
                  </div>
                  <div className="col-span-10 flex flex-col gap-6">
                    <div className="flex justify-between items-center">
                      <h2 className="text-3xl">{userData.name}</h2>
                      <span>Katılım: {new Date(userData.created_at).toLocaleString()}</span>
                    </div>
                    <span>@{userData.login}</span>
                    <p>{userData.bio || "Biyografi eklenmemiş"}</p>
                    <div className="flex bg-gray-900 px-6 py-4 rounded-xl justify-between">
                      <div className="flex flex-col gap-2">
                        <span>Repos</span>
                        <span>{userData.public_repos}</span>
                      </div>
                      <div className="flex flex-col gap-2">
                        <span>Followers</span>
                        <span>{userData.followers}</span>
                      </div>
                      <div className="flex flex-col gap-2">
                        <span>Following</span>
                        <span>{userData.following}</span>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 grid-rows-2 gap-4">
                      <span className="flex items-center gap-2"><FaLocationPin />{userData.location || "Belirtilmemiş"}</span>
                      <span className="flex items-center gap-2"><FaTwitter />{userData.twitter || "Belirtilmemiş"}</span>
                      <span className="flex items-center gap-2"><FaLink />{userData.blog || "Belirtilmemiş"}</span>
                      <span className="flex items-center gap-2"><FaHouse />{userData.company || "Belirtilmemiş"}</span>
                    </div>
                  </div>
                </div>
              )}
          </CardBody>
        </Card>
      )}
      {loading && (
        <Card>
          <CardBody>
            <Spinner />
          </CardBody>
        </Card>
      )}
    </section>
  );
}
