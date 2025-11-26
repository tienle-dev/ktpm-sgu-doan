import axiosClient from './axiosClient'

const CategoryAPI = {
    Get_All_Category: () => {
        const url = '/api/Category'
        return axiosClient.get(url)
    }
}

export default CategoryAPI
