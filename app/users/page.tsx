"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/context/auth-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { useToast } from "@/components/ui/use-toast"
import { Loader2, LogOut, Search } from "lucide-react"
import UserCard from "@/components/user-card"
import EditUserDialog from "@/components/edit-user-dialog"
import DeleteUserDialog from "@/components/delete-user-dialog"

interface User {
  id: number
  email: string
  first_name: string
  last_name: string
  avatar: string
}

interface ApiResponse {
  page: number
  per_page: number
  total: number
  total_pages: number
  data: User[]
}

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([])
  const [filteredUsers, setFilteredUsers] = useState<User[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [userToEdit, setUserToEdit] = useState<User | null>(null)
  const [userToDelete, setUserToDelete] = useState<User | null>(null)

  const { logout, isAuthenticated } = useAuth()
  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/")
      return
    }

    fetchUsers(currentPage)
  }, [currentPage, isAuthenticated, router])

  useEffect(() => {
    if (users.length > 0 && searchQuery) {
      const filtered = users.filter(
        (user) =>
          user.first_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          user.last_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          user.email.toLowerCase().includes(searchQuery.toLowerCase()),
      )
      setFilteredUsers(filtered)
    } else {
      setFilteredUsers(users)
    }
  }, [users, searchQuery])

  const fetchUsers = async (page: number) => {
    setIsLoading(true)
    try {
      const response = await fetch(`https://reqres.in/api/users?page=${page}`)
      if (!response.ok) {
        throw new Error("Failed to fetch users")
      }

      const data: ApiResponse = await response.json()
      setUsers(data.data)
      setFilteredUsers(data.data)
      setTotalPages(data.total_pages)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch users. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleEditUser = (user: User) => {
    setUserToEdit(user)
  }

  const handleDeleteUser = (user: User) => {
    setUserToDelete(user)
  }

  const handleUpdateUser = (updatedUser: User) => {
    setUsers(users.map((user) => (user.id === updatedUser.id ? updatedUser : user)))
    setUserToEdit(null)
    toast({
      title: "User updated",
      description: `${updatedUser.first_name} ${updatedUser.last_name} has been updated.`,
    })
  }

  const handleConfirmDelete = (userId: number) => {
    setUsers(users.filter((user) => user.id !== userId))
    setUserToDelete(null)
    toast({
      title: "User deleted",
      description: "The user has been deleted successfully.",
    })
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex flex-col md:flex-row justify-between items-center mb-8">
        <h1 className="text-3xl font-bold mb-4 md:mb-0">User Management</h1>
        <div className="flex items-center gap-4">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search users..."
              className="pl-8 w-full md:w-[250px]"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Button variant="outline" onClick={logout}>
            <LogOut className="mr-2 h-4 w-4" />
            Logout
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredUsers.map((user) => (
              <UserCard
                key={user.id}
                user={user}
                onEdit={() => handleEditUser(user)}
                onDelete={() => handleDeleteUser(user)}
              />
            ))}
          </div>

          {filteredUsers.length === 0 && (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No users found</p>
            </div>
          )}

          {totalPages > 1 && (
            <div className="flex justify-center mt-8">
              <Card>
                <CardContent className="flex items-center justify-between p-4">
                  <Button
                    variant="outline"
                    onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                  >
                    Previous
                  </Button>
                  <span className="mx-4">
                    Page {currentPage} of {totalPages}
                  </span>
                  <Button
                    variant="outline"
                    onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                  >
                    Next
                  </Button>
                </CardContent>
              </Card>
            </div>
          )}
        </>
      )}

      {userToEdit && (
        <EditUserDialog user={userToEdit} onClose={() => setUserToEdit(null)} onUpdate={handleUpdateUser} />
      )}

      {userToDelete && (
        <DeleteUserDialog user={userToDelete} onClose={() => setUserToDelete(null)} onConfirm={handleConfirmDelete} />
      )}
    </div>
  )
}

