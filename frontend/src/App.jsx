import { useState } from 'react';
import './App.css';
import axios from 'axios';
import langflow from './assets/image.png'
function App() {
  const [select, setselect] = useState('');
  const [mess, setmess] = useState({ message: '' });

  const func = async () => {
    const res = await axios.post('https://pre-hackathon-assignment.onrender.com/run-flow', {
      inputValue: select,
      inputType: 'chat',
      outputType: 'chat',
      stream: false,
    });
    return res;
  };

  const formatMessage = (message) => {
    if (!message) return '';
    return message
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\n/g, '<br />');
  };

  return (
    <>
    



    <section className='mt-3 rounded-lg'>
  <div className="bg-gray-50 mx-auto max-w-screen-xl px-4 py-8 sm:px-6 lg:px-8">
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:items-center md:gap-8">
      <div>
        <div className="flex min-h-full flex-1 flex-col justify-center px-6 py-12 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-sm">
          <img
            alt="Your Company"
            src="https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTJ8fG9wZW4lMjBhaXxlbnwwfHwwfHx8MA%3D%3D"

            className="mx-auto h-12 rounded-lg w-auto"
          />
          <h2 className="mt-10 text-center text-2xl/9 font-bold tracking-tight text-gray-900">
            Accepts post types (e.g., carousel, reels, static images) as input.
          </h2>
         </div>

          <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
          <div>
            <label htmlFor="email" className="block text-sm/6 font-medium text-gray-900">
              Input Type
            </label>
            <div className="mt-2">
              <input
                onChange={(e) => setselect(e.target.value)}
                id="text"
                name="text"
                type="text"
                required
                autoComplete="email"
                className="mb-3 block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6"
              />
            </div>
          </div>

          <div>
            <button
              onClick={() => {
                func().then((res) => {
                  console.log(res.data);
                  
                  setmess(res.data);
                });
              }}
              className="mt-5 flex w-full justify-center rounded-md bg-indigo-600 px-3 py-1.5 text-sm/6 font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
            >
             Get Data
            </button>
          </div>
        </div>
      </div>
      </div>

      <div >
        <img
        className=' rounded-lg'
          src={langflow}
          alt=""
        />
      </div>
    </div>
  </div>
</section>
      
      <div className="  relative mt-10">
        <div className="ml-36 mr-36 mb-5">
        <div className="flex flex-col  bg-white border shadow-sm rounded-xl dark:bg-neutral-900 dark:border-neutral-700 dark:shadow-neutral-700/70">
          <div className="  overflow-y-auto p-4 md:p-5 [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-track]:bg-gray-100 [&::-webkit-scrollbar-thumb]:bg-gray-300 dark:[&::-webkit-scrollbar-track]:bg-neutral-700 dark:[&::-webkit-scrollbar-thumb]:bg-neutral-500">
            <h3 className="text-lg font-bold text-gray-800 dark:text-white">The Data</h3>
            <p
              className=" py-14 mt-5 ml-10 mr-10 text-gray-500 dark:text-neutral-400"
              dangerouslySetInnerHTML={{ __html: formatMessage(mess?.message) }}
            ></p>
          </div>
        </div>
      </div>
      </div>
    </>
  );
}

export default App;
