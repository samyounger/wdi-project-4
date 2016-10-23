class User < ApplicationRecord
  has_secure_password
  has_many :companies
  validates :username, presence: true, uniqueness: true
end
