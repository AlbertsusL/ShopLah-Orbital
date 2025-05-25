import React from 'react'
import "./ContactUsPage.css"
import Swal from 'sweetalert2'

const ContactUsPage = () => {

    const onSubmit = async (event) => {
        event.preventDefault();
        const formData = new FormData(event.target);

        formData.append("access_key", "8cd70a62-6ae3-4e6f-bebf-b1c40154b603");

        const object = Object.fromEntries(formData);
        const json = JSON.stringify(object);

        const res = await fetch("https://api.web3forms.com/submit", {
        method: "POST",
        headers: {
        "Content-Type": "application/json",
        Accept: "application/json"
        },
        body: json
        }).then((res) => res.json());

    if (res.success) {
        Swal.fire( {
        title:'Submitted!',
        text: 'Message Sent Successfully',
        icon: 'success'
      })
      event.target.reset();
    }
  };

  return (
    <section className='contact'>
        <form onSubmit={onSubmit}>
            <h1>Contact Form</h1>
            <div className='input-box'>
                <label>Name</label>
                <input type='text' className='field' placeholder='Enter your Name' 
                name='name' required/>
            </div>
            <div className='input-box'>
                <label>Phone Number</label>
                <input type='text' className='field' placeholder='Enter your Phone Number' 
                name='number' required/>
            </div>
            <div className='input-box'>
                <label>Email Address</label>
                <input type='text' className='field' placeholder='Enter your Email Address' 
                name='email' required/>
            </div>
            <div className='input-box'>
                <label>Your Message</label>
                <textarea name='message' placeholder='Enter your message' 
                className='field mess' required></textarea>
            </div>
            <button type='submit'>Send Message</button>
        </form>
    </section>
  )
}

export default ContactUsPage;
