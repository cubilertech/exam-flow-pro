// import { Button } from "@/components/ui/button";
// import { set } from "date-fns";
// import { useState } from "react";
// // import {
// //   applyPolyfills,
// //   defineCustomElements as TwilightWebComponents
// // } from '@salla.sa/twilight-components/loader';

// // import '@salla.sa/twilight';
// import twilight from '@salla.sa/twilight';
// const Payment = () => {
//   const [loginState, setLoginState] = useState('login-form');
//   const [otp, setOtp] = useState('');
//   const [email, setEmail] = useState('');
//   const handleLogin = () => {
//     try{
//     twilight.auth.login({ type: 'mobile', redirect: true, country_code:'PK',phone:email });
//     setLoginState('login-otp');
//     }
//     catch(err){
//       console.log(err)
//     }

//   }
//   const handleVerify = () => {
//     twilight.auth.verify({
//       type: 'email',
//       email: email,
//       code: otp
//     }).then((response) => {
//       /* add your code here */
//       console.log(response);
//     }).catch((error) => {
//       console.error('Verification failed:', error);
//     }
//     );

//   }

//   const handleRegister = () => {
//     twilight.auth.register({
//   first_name: 'Mohammed',
//   last_name: 'Ahmed',
//   phone: '3007125372',
//   // email: 'muhammadwaqas3447@gmail.com',
//   country_code: 'PK',
//   country_key: '92',
//   verified_by: 'phone',
//   code: '123'
// }).then((response) => {
//   /* add your code here */
//   console.log(response);
// }).catch((error) => {
//   console.error('Registration failed:', error);
// });
//   }
// //   applyPolyfills().then(() => {
// //     TwilightWebComponents(window);
// // });
//   // const handleClick = () => {
//   //     // window.open(' https://accounts.salla.sa/oauth2/token?client_id=232aead5-7715-40d4-a0fe-a25732e92ea5&client_secret=3b86fe303fe5e147da28690379805c88&response_type=code&redirect_uri=http://localhost:8080/callback-url&scope=offline_access&state=12222323&code=SP_76kPyYoDE8VBrzHRzUKt1PvcbLKPjTEcIR8rvFsHK9KyRWeX0rEYk')

//   //     window.open(' https://accounts.salla.sa/oauth2/auth?client_id=232aead5-7715-40d4-a0fe-a25732e92ea5&client_secret=3b86fe303fe5e147da28690379805c88&response_type=code&redirect_uri=http://localhost:8001/salla/oauth2&scope=offline_access&state=12222323&code=SP_76kPyYoDE8VBrzHRzUKt1PvcbLKPjTEcIR8rvFsHK9KyRWeX0rEYk')
//   //     // window.open('https://salla.design/imirzabilal7/?expires=1746455827&identifier=71033543&utm_source=portal&signature=7d1ca9c0bb421bf927ad5c2a7c6a928ef7fb0686c09f61540cebd9041af64a44','_blank');
//   // }
// //    const handleLogin = () => {
// //     try{
// //     twilight.auth.login({ type: 'email', redirect: true, email:'muhammadwaqas3447@gmail.com' });
// // twilight.auth.verify({
// //   type: 'email',
// //   email: 'muhammadwaqas3447@gmail.com',
// //   code: '1111'
// // }).then((response) => {
// //   /* add your code here */
// //   console.log(response)
// // });
// //     }
// //     catch(err){
// //       console.log(err)
// //     }

// //   };
//    return (
//    <>
//    <button onClick={handleRegister} >Register</button>
//    {loginState === 'login-form' && <div><input value={email} onChange={e => setEmail(e.target.value)}/><button onClick={handleLogin}>Login</button></div>}
//    {loginState === 'login-otp' && <div><input value={otp} onChange={e => setOtp(e.target.value)}/><button onClick={handleVerify}>Verify</button></div>}
// {/* <salla-button fill="outline" color="dark">Hello World 👋</salla-button> */}

//   {/* <button onClick={handleLogin} className="s-button-primary-outline" color="dark">Hello World 👋</button> */}
// {/* <salla-tel-input country-code="sa" mobile="555555555"></salla-tel-input> */}

// {/* <salla-product-availability channels="sms,email"></salla-product-availability> */}
//    {/* <Button onClick={handleClick}>Subscribe</Button> */}
// {/* <salla-button width="wide" onClick="salla.event.emit('login::open')">
//   Login
// </salla-button> */}

// {/* <salla-tel-input country-code="sa" mobile="555555555"></salla-tel-input> */}

// {/* <salla-login-modal is-email-allowed is-email-required is-mobile-allowed>
//   <div slot="before-login-email">
//   </div>

//    <div slot="after-login-mobile">
//    </div>
// </salla-login-modal> */}
//    </>

//   );

//   // const handleCreatePayment = () => {
//   //   const options = {
//   //   method: "POST",
//   //   headers: { Authorization: "Bearer sk_test_GM34ihbYXa8wcKjqenoQFHS2", "Content-Type": "application/json" },
//   //   body: JSON.stringify({
//   //   title: 'Mr.',
//   //   first_name: 'Ahmed',
//   //   middle_name: 'M',
//   //   last_name: 'Al Nasser',
//   //   email: 'a.alnasser@example.com',
//   //   phone: {country_code: '965', number: '51234567'},
//   //   currency: 'USD',
//   //   nationality: 'SA',
//   //   description: 'A valued customer since 2021.',
//   //   metadata: {customer_segment: 'VIP', preferred_contact_method: 'email'},
//   //   card: {id: 'card_c14v24231144JRiz21UM7G141', mode: 'DEFAULT'}
//   // })
//   //   };

//   //   fetch("https://api.tap.company/v2/customers", options)
//   //     .then((res) => res.json())
//   //     .then((res) => console.log(res))
//   //     .catch((err) => console.error(err));
//   // };
//   // return (
//   //   <div className="flex flex-col items-center justify-center h-screen">
//   //     <h1 className="text-2xl font-bold mb-4">Payment Page</h1>
//   //     <p className="mb-4">
//   //       Please click the button below to proceed with the payment.
//   //     </p>
//   //     <Button
//   //       onClick={handleCreatePayment}
//   //       className="bg-blue-500 text-white px-4 py-2 rounded"
//   //     >
//   //       Pay Now
//   //     </Button>
//   //   </div>
//   // );
// };

// export default Payment;

import { Button } from "@/components/ui/button";
import {
  TapCard,
  Currencies,
  Direction,
  Edges,
  Locale,
  Theme,
} from "@tap-payments/card-sdk";
import { useEffect, useState } from "react";
import {
  resetCardInputs,
  saveCard,
  tokenize,
  updateCardConfiguration,
  updateTheme,
  loadSavedCard,
} from "@tap-payments/card-sdk";
import axios from "axios";

const Payment = () => {
  const [activeCheckout, setActiveCheckout] = useState(false);
  const [resp, setResp] = useState(null);
  const publicKey = import.meta.env.VITE_TAP_API_KEY;
  const handleValidInputChange = (data: any) => {
    if (data == true) {
      setActiveCheckout(true);
    }
    // else{
    //     setActiveCheckout(false);

    // }
    console.log("Valid input:", data);
  };
  const handleInvalidInputChange = (data: any) => {
    if (data == true) {
      setActiveCheckout(false);
    }
    // else{
    //     setActiveCheckout(true);
    // }
    console.log("Invalid input:", data);
  };
  const handleCheckoutInitiated = async (data: any) => {
    console.log("Checkout initiated:", data);
    const resp = await axios.post(
      "http://localhost:8001/start-checkout",
      {
        token: data.id,
        amount: 10,
        currency: Currencies.SAR,
        metadata: {
          order_id: "12345",
        },
        customer: {
          first_name: "test",
          middle_name: "test",
          last_name: "test",
          email: "test@test.com",
          phone: {
            country_code: 965,
            number: 51234567,
          },
        },
      },
      {
        headers: {
          Authorization: `Bearer ${publicKey}`,
        },
      }
    );
    setResp(resp);
    console.log("Checkout response:", resp.data);
  };
  useEffect(() => {
    if (resp) {
      console.log("Response received:", resp.data);
      window.open(resp.data.transaction.url, "_blank");
    }
  }, [resp]);
  return (
    <>
      <TapCard
        publicKey={"pk_test_EtHFV4BuPQokJT6jiROls87Y"}
        // merchant={{
        // 	id: 'merchant id'
        // }}
        transaction={{
          amount: 1,
          currency: Currencies.SAR,
        }}
        // customer={{
        // 	id: 'customer id',
        // 	name: [
        // 		{
        // 			lang: Locale.EN,
        // 			first: 'Ahmed',
        // 			last: 'Sharkawy',
        // 			middle: 'Mohamed'
        // 		}
        // 	],
        // 	nameOnCard: 'Ahmed Sharkawy',
        // 	editable: true,
        // 	contact: {
        // 		email: 'ahmed@gmail.com',
        // 		phone: {
        // 			countryCode: '20',
        // 			number: '1000000000'
        // 		}
        // 	}
        // }}
        acceptance={{
          supportedBrands: ["AMEX", "VISA", "MASTERCARD", "MADA"],
          supportedCards: ["CREDIT", "DEBIT"],
        }}
        fields={{
          cardHolder: true,
          cvv: true,
          savedCardCVV: true,
        }}
        addons={{
          displayPaymentBrands: true,
          loader: true,
          saveCard: false,
        }}
        interface={{
          locale: Locale.EN,
          theme: Theme.LIGHT,
          edges: Edges.CURVED,
          direction: Direction.LTR,
        }}
        onReady={() => console.log("onReady")}
        onFocus={() => console.log("onFocus")}
        onBinIdentification={(data) => console.log("onBinIdentification", data)}
        onValidInput={handleValidInputChange}
        onInvalidInput={handleInvalidInputChange}
        onError={(data) => console.log("onError", data)}
        onSuccess={handleCheckoutInitiated}
      />
      <Button onClick={tokenize} disabled={!activeCheckout}>
        Checkout
      </Button>
    </>
  );
};
export default Payment;
