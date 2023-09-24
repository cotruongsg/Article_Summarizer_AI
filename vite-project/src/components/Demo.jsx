import React, { useState, useEffect } from "react";
import { copy, linkIcon, loader, tick , volume_unmute , volume_mute } from "../assets";
import { useLazyGetSummaryQuery } from "../services/article"

const Demo = () => {
  const [article,setArticle]= useState({
    url: '',
    summary: '',
  })

  const [allArticles,setAllArticles] = useState([])
  const [copied, setCopied] = useState("");
  const [isMuted, setIsMuted] = useState(true); // Initialize as muted

 // RTK lazy query
  const [getSummary, { error, isFetching }] = useLazyGetSummaryQuery();

  useEffect(()=>{
    const articlesFromLocalStorage = JSON.parse(
      localStorage.getItem('articles')
    )

    if (articlesFromLocalStorage) {
      setAllArticles(articlesFromLocalStorage)
    }

    // // Read the summary when it becomes available
    // if (article.summary) {
    //   handleTextToSpeech(article.summary);
    // }
    
  },[])

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { data } = await getSummary({ articleUrl: article.url });  
    
    if(data?.summary) {
      const newArticle = { ...article, summary: data.summary };
      const updatedAllArticles = [newArticle,...allArticles]     
      setArticle(newArticle)    
      setAllArticles(updatedAllArticles) 
      localStorage.setItem('articles',JSON.stringify(updatedAllArticles))
    }
  }

  // copy the url and toggle the icon for user feedback
  const handleCopy = (copyURL) => {
    setCopied(copyURL)
    navigator.clipboard.writeText(copyURL)
    setTimeout(()=> setCopied(false),3000)
  }

  // Read Text
  const handleTextToSpeech = (sum) => {
    const synth = window.speechSynthesis;
  
    // Create a SpeechSynthesisUtterance
    const article_summary = new SpeechSynthesisUtterance(sum);
    
    // Start reading the text
    synth.speak(article_summary);

    // Continuously check the isMuted state while reading
    const checkMuteInterval = setInterval(() => {
      if (isMuted) {
        // If muted, cancel the speech synthesis
        synth.cancel();
        clearInterval(checkMuteInterval); // Stop checking
      }
    }, 1000); // Check every second (adjust as needed)
  }

  // Toggle mute/unmute
  const toggleMute = () => {
    setIsMuted(!isMuted);
    if (isMuted) {
      const synth = window.speechSynthesis;
      synth.cancel();
    } else {
      handleTextToSpeech(article.summary);
    }
  }

  // Toggle mute when click to another article
  const toggleMuteNow = () => {
    setIsMuted(!isMuted); 
    if (isMuted) {
      const synth = window.speechSynthesis;
      synth.cancel();
    }
  }

  return (
    <section className="mt-16 w-full max-w-xl">
      <div className="flex flex-col w-full gap-2">
        <form  className='relative flex justify-center items-center'
               onSubmit={handleSubmit}
        >
          <img
            src={linkIcon}
            alt="link_icon"
            className="absolute left-0 my-2 ml-3 w-5"
          />
          <input
            type="url"
            placeholder="Enter a URL"
            value={article.url}
            onChange={(e)=> setArticle({...article,url:e.target.value})}
            required
            className="url_input peer"
          />
          <button
            type="submit"
            className="submit_btn peer-focus:border-gray-700 peer-focus:text-gray-700"
          >
            ↵
          </button>       
        </form>
        {/* Browser history */}
        <div className="flex flex-col gap-1 max-h-60 overflow-y-auto">
          {allArticles.map((item,index) => (
            <div
              key= {`link-${index}`}
              onClick={()=> setArticle(item)}
              className="link_card"
            >
              <div className="copy_btn" onClick={()=> handleCopy(item.url)}>
                <img
                  src={copied === item.url ? tick : copy}
                  alt={copied === item.url ? "tick_icon" : "copy_icon"}
                  className="w-[60%] h-[60%] object-contain"                
                />
              </div>
              <p className="flex-1 font-satoshi text-blue-700 font-medium text-sm truncate"
                 onClick={toggleMuteNow}
              >
                {item.url}
              </p>
            </div>
          ))}
        </div>
      </div>
      {/* Display Result */}
      <div className='my-10 max-w-full flex justify-center items-center'>
        {isFetching ? (
          <img src={loader} alt='loader' className='w-20 h-20 object-contain' />
        ) : error ? (
          <p className='font-inter font-bold text-black text-center'>
            Well, that wasn't supposed to happen...
            <br />
            <span className='font-satoshi font-normal text-gray-700'>
              {error?.data?.error}
            </span>
          </p>
        ) : (
          article.summary && (
            <div className='flex flex-col gap-3'>
              <h2 className='font-satoshi font-bold text-gray-600 text-xl'>
                Article <span className='blue_gradient'>Summary</span>
              </h2>
              <div className='summary_box flex relative'>
                <p className='font-inter font-medium text-sm text-gray-700'>
                  {article.summary} 
                </p>  
                <span className="absolute top-[-15px] right-0">
                  {isMuted ? <img src={volume_unmute} onClick={toggleMute}/> : <img src={volume_mute} onClick={toggleMute}/>}                          
                </span>              
              </div>
            </div>
          )
        )}
      </div>
    </section>
  )
}

export default Demo