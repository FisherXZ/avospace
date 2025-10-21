'use client'
import Link from 'next/link'
import Post from '../../components/Post'

export default function Home() {
    return (
        <div className='container-fluid nav-margin bg-light'>
            <div className='row'>
                <div
                    className='col-3 bg-light vh-100 fixed-top sidebar'
                    style={{ position: 'fixed', top: '9vh', bottom: 0, overflowY: 'auto' }}
                >
                    <ul className="mt-4">
                        <li className="primary">thing 1</li>
                        <li className="primary">thing 2</li>
                    </ul>
                </div>
                <div
                    className='col-9 bg-white'
                    style={{
                        marginTop: '6vh', marginLeft: '25%', paddingTop: '5vh', height: '91vh', overflowY: 'auto',
                        borderTopLeftRadius: '5vh'
                    }}
                >
                    <div className="container">
                        <h1>Home</h1>
                        <Post />
                        <div>
                            <h2 className="mb-4">Feed</h2>
                            <div className="space-y-4">
                                {Array.from({ length: 30 }).map((_, i) => (
                                    <div key={i} className="bg-white p-4 rounded shadow mb-3">
                                        Post #{i + 1}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

