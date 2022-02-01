import { useState } from 'react'
import { sanityClient, urlFor } from '../../sanity'
import Header from '../../components/Header'
import { Post } from '../../typings'
import { GetStaticProps } from 'next'
import PortableText from 'react-portable-text'
import Head from 'next/head'
import { useForm, SubmitHandler } from 'react-hook-form'

interface IFormInput {
    _id: string
    name: string
    email: string
    comment: string
}

interface Props {
    post: Post
}

function Post({ post }: Props) {
    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<IFormInput>() // form fields will be checked against IFormInput custom datatype

    const [submitted, setSubmitted] = useState(false)

    const onSubmit: SubmitHandler<IFormInput> = (data) => {
        fetch('/api/createComment', {
            method: 'POST',
            body: JSON.stringify(data),
        })
            .then(() => {
                console.log(data)
                setSubmitted(true)
            })
            .catch((err) => {
                setSubmitted(false)
                console.log(err)
            })
    }

    return (
        <main>
            <Head>
                <title>Medium - {post.title}</title>
            </Head>
            <Header />

            <img
                className="w-full h-40 object-cover"
                src={urlFor(post.mainImage).url()!}
                alt=""
            />

            <article className="max-w-3xl mx-auto p-5">
                <h1 className="text-3xl mt-10 mb-3">{post.title}</h1>
                <h2 className="text-xl font-light text-gray-500 mb-2">
                    {post.description}
                </h2>

                <div className="flex items-center space-x-2">
                    <img
                        className="w-10 h-10 rounded-full"
                        src={urlFor(post.author.image).url()!}
                        alt=""
                    />

                    <p className="font-extralight text-sm">
                        Blog post by{' '}
                        <span className="text-green-600">
                            {post.author.name}
                        </span>{' '}
                        - published at{' '}
                        {new Date(post._createdAt).toLocaleString()}
                    </p>
                </div>

                <div className="mt-10">
                    <PortableText
                        className=""
                        dataset={process.env.NEXT_PUBLIC_SANITY_DATASET!}
                        projectId={process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!}
                        content={post.body}
                        serializers={{
                            h1: (props: any) => (
                                <h1
                                    className="text-2xl font-bold my-5"
                                    {...props}
                                />
                            ),

                            h2: (props: any) => (
                                <h1
                                    className="text-xl font-bold my-5"
                                    {...props}
                                />
                            ),

                            h3: (props: any) => (
                                <h1
                                    className="text-lg font-bold my-5"
                                    {...props}
                                />
                            ),

                            li: ({ children }: any) => (
                                <li className="ml-4 list-disc">{children}</li>
                            ),

                            link: ({ href, children }: any) => (
                                <a
                                    href={href}
                                    className="text-blue-500 hover:underline"
                                >
                                    {children}
                                </a>
                            ),
                        }}
                    />
                </div>
            </article>

            <hr className="max-w-lg my-5 mx-auto border border-yellow-500"></hr>

            {!submitted ? (
                <form
                    onSubmit={handleSubmit(onSubmit)}
                    className="flex flex-col p-5 max-w-2xl mx-auto mb-10"
                >
                    <h3 className="text-sm text-yellow-500">
                        Enjoyed this article?
                    </h3>
                    <h4 className="text-3xl font-bold">
                        Leave a comment below!
                    </h4>
                    <hr className="py-3 mt-2"></hr>

                    <input
                        {...register('_id')}
                        type="hidden"
                        name="_id"
                        value={post?._id}
                    />

                    <label className="formLabelStyle">
                        <span className="text-gray-700">Name</span>
                        <input
                            {...register('name', { required: true })}
                            className="inputStyle form-input"
                            placeholder="John Appleseed"
                            type="text"
                        />
                    </label>

                    <label className="formLabelStyle">
                        <span className="text-gray-700">Email</span>
                        <input
                            {...register('email', { required: true })}
                            className="inputStyle form-input"
                            placeholder="example@company.com"
                            type="email"
                        />
                    </label>

                    <label className="formLabelStyle">
                        <span className="text-gray-700">Comment</span>
                        <textarea
                            {...register('comment', { required: true })}
                            className="inputStyle form-textarea"
                            placeholder="Leave a comment"
                            rows={8}
                        />
                    </label>

                    {/* errors will appear here */}
                    <div className="flex flex-col p-5">
                        {errors.name && (
                            <span className="text-red-500">
                                The name field is required
                            </span>
                        )}

                        {errors.email && (
                            <span className="text-red-500">
                                The email field is required
                            </span>
                        )}

                        {errors.comment && (
                            <span className="text-red-500">
                                The comment field is required
                            </span>
                        )}
                    </div>

                    <input
                        value="Submit"
                        type="submit"
                        className="shadow bg-yellow-500 hover:bg-yellow-400 focus:shadow-outline focus:outline-none text-white font-bold py-2 px-4 rounded cursor-pointer"
                        onSubmit={handleSubmit(onSubmit)}
                    />
                </form>
            ) : (
                <div className="flex flex-col py-10 my-10 bg-yellow-500 text-white max-w-2xl mx-auto px-5">
                    <h3 className="text-3xl font-bold">
                        Thank you for submitting
                    </h3>
                    <p>Once it has been approved, it will appear below</p>
                </div>
            )}

            <div className="flex flex-col p-10 my-10 max-w-2xl mx-auto shadow-yellow-500 shadow space-x-2">
                <h3 className="text-4xl">Comments</h3>
                <hr className="pb-2" />
                {post.comments.map((comment) => (
                    <div key={comment._id}>
                        <p>
                            <span className="text-yellow-500">
                                {comment.name}
                            </span>
                            : {comment.comment}
                        </p>
                    </div>
                ))}
            </div>
        </main>
    )
}

export default Post

export const getStaticPaths = async () => {
    const query = `
    *[_type == 'post'] {
        _id,
        slug {
        current
      }
      }`

    const posts = await sanityClient.fetch(query)

    const paths = posts.map((post: Post) => ({
        params: {
            slug: post.slug.current,
        },
    }))

    return {
        paths,
        fallback: 'blocking', // true or false, depending on whether notFound is false or true
        // precautionary measure to render 404 page
    }
}

export const getStaticProps: GetStaticProps = async ({ params }) => {
    const query = `* [_type == 'post' && slug.current == $slug][0] {
        _id,
        _createdAt,
        title,
        slug,
        author -> {
        name,
        image
      },
      'comments': *[
        _type == 'comment' &&
        post._ref == ^._id
      ],
      description,
      mainImage,
      slug,
      body
      }`

    const post = await sanityClient.fetch(query, {
        slug: params?.slug,
    })

    console.log(post)

    if (!post) {
        return {
            notFound: true,
        }
    }

    return {
        props: {
            post,
        },
        revalidate: 60, // after 60 seconds, it will update the old cached version
    }
}
