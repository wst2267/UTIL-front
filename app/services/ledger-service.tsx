import axios from 'axios';

export async function GetLedger(username: string) {
    await axios.get(`https://localhost:7104/api/ledger/getledger?userName=${username}`)
        .then(response => {
            console.log("service: ", response)
            return response.data;
        })
        .catch(error => {
            console.error(error)
        })
}